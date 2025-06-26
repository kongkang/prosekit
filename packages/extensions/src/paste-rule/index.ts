import {
  defineFacet,
  defineFacetPayload,
  pluginFacet,
  type PlainExtension,
  type PluginPayload,
} from '@prosekit/core'
import type { Slice } from '@prosekit/pm/model'
import {
  PluginKey,
  ProseMirrorPlugin,
} from '@prosekit/pm/state'
import type { EditorView } from '@prosekit/pm/view'

/**
 * Defines an paste rule. A paste rule can be used to transform pasted or
 * dragged-and-dropped content before it is applied to the document.
 *
 * @param options
 *
 * @public
 */
export function definePasteRule(options: PasteRuleOptions): PlainExtension {
  return definePasteRulePlugin(options)
}

/**
 * @public
 *
 * Options for {@link PasteRuleHandler}.
 */
export interface PasteRuleHandlerOptions {
  /**
   * The slice to be pasted.
   */
  slice: Slice

  /**
   * The editor view.
   */
  view: EditorView
}

/**
 * @public
 *
 * Can be used to transform pasted or dragged-and-dropped content before it is
 * applied to the document.
 */
export type PasteRuleHandler = (options: PasteRuleHandlerOptions) => Slice

/**
 * Options for {@link definePasteRule}.
 *
 * @public
 */
export type PasteRuleOptions = {
  /**
   * A function to be called when a paste rule is triggered.
   */
  handler: PasteRuleHandler
}

/**
 * @internal
 */
const pasteRuleFacet = defineFacet<PasteRuleHandler, PluginPayload>({
  reduce: () => {
    let handlers: PasteRuleHandler[] = []

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

    return (inputs: PasteRuleHandler[]) => {
      handlers.length = 0
      for (const input of inputs) {
        handlers.push(input)
      }
      return plugin
    }
  },
  singleton: true,
  parent: pluginFacet,
})

/**
 * @internal
 */
function definePasteRulePlugin({ handler }: PasteRuleOptions): PlainExtension {
  return defineFacetPayload(pasteRuleFacet, [handler]) as PlainExtension
}
