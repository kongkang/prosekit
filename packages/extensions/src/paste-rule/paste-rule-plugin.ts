import {
  defineFacet,
  defineFacetPayload,
  pluginFacet,
  type PlainExtension,
  type PluginPayload,
} from '@prosekit/core'
import { toReversed } from '@prosekit/core'
import type { Slice } from '@prosekit/pm/model'
import {
  PluginKey,
  ProseMirrorPlugin,
} from '@prosekit/pm/state'
import type { EditorView } from '@prosekit/pm/view'

type PasteRulePayload = (options: { slice: Slice; view: EditorView }) => Slice

/**
 * @internal
 */
const pasteRuleFacet = defineFacet<PasteRulePayload, PluginPayload>({
  reduce: () => {
    let handlers: PasteRulePayload[] = []

    const transformPasted = (slice: Slice, view: EditorView): Slice => {
      for (const handler of handlers) {
        slice = handler({ slice, view })
      }
      return slice
    }

    const plugin = new ProseMirrorPlugin({
      key: new PluginKey('prosekit-paste-rule'),
      props: { transformPasted },
    })

    return (inputs: PasteRulePayload[]) => {
      handlers = [...inputs].reverse() // TODO: test it
      return plugin
    }
  },
  singleton: true,
  parent: pluginFacet,
})

/**
 * @internal
 */
export function definePasteRulePlugin(payload: PasteRulePayload): PlainExtension {
  return defineFacetPayload(pasteRuleFacet, [payload]) as PlainExtension
}
