import {useCallback} from 'react'
import {useClient, type DocumentActionComponent, type DocumentActionProps} from 'sanity'
import {pathFor} from '../lib/slugRules'

/**
 * Publish, creating a redirect when a live URL changes.
 *
 * Wrapping publish rather than adding a separate action is deliberate: this
 * has to happen on the one path an editor always takes. An action someone
 * has to remember to click is an action that gets missed, and the cost of
 * missing it is a live URL that starts returning 404 while keeping every
 * inbound link it ever earned.
 *
 * Only fires when a *published* document's slug changes. Renaming a draft
 * that was never live has no URL to preserve.
 */
export function withSlugRedirect(
  OriginalPublish: DocumentActionComponent,
): DocumentActionComponent {
  const Wrapped: DocumentActionComponent = (props: DocumentActionProps) => {
    const original = OriginalPublish(props)
    const client = useClient({apiVersion: '2026-07-01'})
    const {published, draft, type} = props

    const onHandle = useCallback(async () => {
      const oldSlug = (published as {slug?: {current?: string}} | null)?.slug?.current
      const newSlug = (draft as {slug?: {current?: string}} | null)?.slug?.current

      if (oldSlug && newSlug && oldSlug !== newSlug) {
        const from = pathFor(type, oldSlug)
        const to = pathFor(type, newSlug)
        if (from && to) {
          try {
            // createIfNotExists on a deterministic id: republishing after a
            // rename must not stack duplicate redirects for the same hop.
            await client.createIfNotExists({
              _id: `redirect-${type}-${oldSlug}`.slice(0, 128),
              _type: 'redirect',
              from,
              to,
              permanent: true,
              reason: `Slug changed on ${type}`,
              createdAt: new Date().toISOString(),
            })
          } catch (error) {
            // Never block a publish on this. A missing redirect is a problem;
            // a document that cannot be published is a worse one.
            console.error('[redirect] could not record slug change', error)
          }
        }
      }
      original?.onHandle?.()
    }, [client, draft, published, type, original])

    if (!original) return null
    return {...original, onHandle}
  }

  Wrapped.action = OriginalPublish.action
  return Wrapped
}
