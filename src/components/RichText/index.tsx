import React from 'react'

import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CMSLink } from '@/components/Link'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const BLOCK_NODE_TYPES = new Set(['heading', 'paragraph', 'list', 'quote', 'code', 'block'])

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'pages' ? `/${slug}` : `/${relationTo}/${slug}`
}

function createJsxConverters(demoteExtraHeroH1: boolean): JSXConvertersFunction<NodeTypes> {
  let heroH1Count = 0

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
    heading: ({ node, nodesToJSX }) => {
      const requested = (node.tag as keyof React.JSX.IntrinsicElements) || 'h2'
      let Tag: keyof React.JSX.IntrinsicElements = requested
      let demotedClass: string | undefined

      if (demoteExtraHeroH1 && requested === 'h1') {
        heroH1Count += 1
        if (heroH1Count > 1) {
          Tag = 'div'
          demotedClass = 'hero-rich-demoted-h1'
        }
      }

      const children = node.children ?? []
      const inline = children.filter((c) => !BLOCK_NODE_TYPES.has((c as { type?: string }).type ?? ''))
      const blocks = children.filter((c) => BLOCK_NODE_TYPES.has((c as { type?: string }).type ?? ''))
      return (
        <div>
          <Tag className={demotedClass}>{nodesToJSX({ nodes: inline })}</Tag>
          {blocks.length > 0 ? nodesToJSX({ nodes: blocks }) : null}
        </div>
      )
    },
    paragraph: ({ node, nodesToJSX }) => {
      // Use <div> instead of <p> to avoid hydration errors when block elements
      // (headings, other divs) are nested inside paragraph nodes from Lexical
      const children = nodesToJSX({ nodes: node.children })
      const style: React.CSSProperties = {}
      if (node.format === 'center') style.textAlign = 'center'
      if (node.format === 'right') style.textAlign = 'right'
      if (node.format === 'left') style.textAlign = 'left'
      if (node.indent) style.paddingInlineStart = `${node.indent * 2}rem`

      return (
        <div style={Object.keys(style).length > 0 ? style : undefined}>{children}</div>
      )
    },
    blocks: {
      banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
      cta: ({ node }) => {
        const { links, richText, contrastStyle = 'default' } = node.fields as CTABlockProps
        const isDark = contrastStyle === 'blackBgWhiteText'
        const isLight = contrastStyle === 'whiteBgBlackText'

        return (
          <div className="container">
            <div
              className={cn(
                'rounded-none border p-4 flex flex-col gap-4',
                {
                  'bg-card border-border': contrastStyle === 'default',
                  'bg-black border-white/20 text-white [&_.prose]:text-white [&_.prose_*]:text-white [&_.payload-richtext_a]:text-white':
                    isDark,
                  'border border-white/20 bg-white/5 text-foreground backdrop-blur-sm [&_.prose]:text-foreground [&_.prose_*]:text-foreground/90 [&_.payload-richtext_a]:text-primary':
                    isLight,
                },
              )}
            >
              <div className="max-w-[48rem]">
                {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
              </div>
              <div className="flex flex-col gap-4 items-start">
                {(links || []).map(({ link }, i) => {
                  return <CMSLink key={i} size="lg" {...link} appearance={link?.appearance || 'default'} />
                })}
              </div>
            </div>
          </div>
        )
      },
      mediaBlock: ({ node }) => (
        <MediaBlock
          className="col-start-1 col-span-3"
          imgClassName="m-0"
          {...node.fields}
          captionClassName="mx-auto max-w-[48rem]"
          enableGutter={false}
          disableInnerContainer={true}
        />
      ),
      code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    },
  })
}

const defaultJsxConverters = createJsxConverters(false)

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  /** High-impact hero: keep first Lexical h1 as &lt;h1&gt;; demote later h1 to styled divs. */
  demoteExtraHeroH1?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    demoteExtraHeroH1 = false,
    ...rest
  } = props

  const converters = demoteExtraHeroH1 ? createJsxConverters(true) : defaultJsxConverters

  return (
    <ConvertRichText
      converters={converters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose prose-invert text-base prose-a:text-primary md:text-[1.125rem] md:prose-md':
            enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
