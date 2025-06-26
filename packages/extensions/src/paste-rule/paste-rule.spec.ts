import {
  collectChildren,
  union,
  type PlainExtension,
} from '@prosekit/core'
import type { ProseMirrorNode } from '@prosekit/pm/model'
import {
  Fragment,
  Slice,
} from '@prosekit/pm/model'
import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  defineTestExtension,
  setupTestFromExtension,
} from '../testing'

import { definePasteRule } from './paste-rule'

function replaceTextInSlice(slice: Slice, from: string, to: string): Slice {
  return new Slice(
    replaceTextInFragment(slice.content, from, to),
    slice.openStart,
    slice.openEnd,
  )
}

function replaceTextInFragment(fragment: Fragment, from: string, to: string): Fragment {
  const nodes = collectChildren(fragment)
  return Fragment.fromArray(nodes.map(node => replaceTextInNode(node, from, to)))
}

function replaceTextInNode(node: ProseMirrorNode, from: string, to: string): ProseMirrorNode {
  const text = node.text
  if (text != null) {
    return node.type.schema.text(text.replaceAll(from, to))
  }
  return node.copy(replaceTextInFragment(node.content, from, to))
}

function defineTextReplacePasteRule(from: string, to: string): PlainExtension {
  return definePasteRule({
    handler: ({ slice }) => {
      return replaceTextInSlice(slice, from, to)
    },
  })
}

describe('paste rule', () => {
  it('can transform pasted HTML', () => {
    const extension = union(
      defineTestExtension(),
      defineTextReplacePasteRule('Foo', 'Bar'),
    )
    const { editor } = setupTestFromExtension(extension)
    editor.view.pasteHTML('<div>Foo</div>')
    expect(editor.getDocHTML()).not.toContain(`Foo`)
    expect(editor.getDocHTML()).toContain(`Bar`)
  })
})
