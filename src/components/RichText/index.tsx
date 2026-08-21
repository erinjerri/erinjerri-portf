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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const docField = linkNode.fields.doc
  const relationTo = docField?.relationTo
  const value = docField?.value

  if (!relationTo) return '#'

  if (typeof value === 'string' || typeof value === 'number') {
    return '#'
  }

  if (!value || typeof value !== 'object') return '#'

  const slug = (value as { slug?: string | null }).slug
  if (typeof slug !== 'string' || !slug.trim()) return '#'

  return relationTo === 'pages' ? `/${slug}` : `/${relationTo}/${slug}`
}

const renderUploadNode = ({ node }: { node: { value?: unknown; fields?: { alt?: string } | null } }) => {
  if (!isRecord(node.value)) return null

  const uploadDoc = node.value as {
    alt?: string | null
    filename?: string | null
    height?: number | null
    mimeType?: string | null
    sizes?: Record<
      string,
      | {
          filename?: string | null
          height?: number | null
          mimeType?: string | null
          url?: string | null
          width?: number | null
        }
      | undefined
    >
    url?: string | null
    width?: number | null
  }

  const alt = node.fields?.alt || uploadDoc.alt || ''
  const url = typeof uploadDoc.url === 'string' ? uploadDoc.url : ''
  const mimeType = typeof uploadDoc.mimeType === 'string' ? uploadDoc.mimeType : ''

  if (!url) return null
  if (!mimeType || !mimeType.startsWith('image')) {
    return (
      <a href={url} rel="noopener noreferrer">
        {uploadDoc.filename || alt || url}
      </a>
    )
  }

  if (!uploadDoc.sizes || !Object.keys(uploadDoc.sizes).length) {
    return <img alt={alt} height={uploadDoc.height || undefined} src={url} width={uploadDoc.width || undefined} />
  }

  const pictureJSX: React.ReactNode[] = []
  for (const size in uploadDoc.sizes) {
    const imageSize = uploadDoc.sizes[size]
    if (
      !imageSize ||
      !imageSize.width ||
      !imageSize.height ||
      !imageSize.mimeType ||
      !imageSize.filename ||
      !imageSize.url
    ) {
      continue
    }

    pictureJSX.push(
      <source key={size} media={`(max-width: ${imageSize.width}px)`} srcSet={imageSize.url} type={imageSize.mimeType} />,
    )
  }

  pictureJSX.push(
    <img key="image" alt={alt} height={uploadDoc.height || undefined} src={url} width={uploadDoc.width || undefined} />,
  )

  return <picture>{pictureJSX}</picture>
}

function createJsxConverters(
  demoteExtraHeroH1: boolean,
  demoteExtraH1: boolean = false,
): JSXConvertersFunction<NodeTypes> {
  let heroH1Count = 0
  let articleH1Count = 0

  return ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
    upload: renderUploadNode,
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
      } else if (demoteExtraH1 && requested === 'h1') {
        // Authors routinely pick H1 for every section heading in Lexical, which
        // leaves a post with no heading hierarchy. It also breaks vertical
        // rhythm: prose gives h1 `margin-top: 0` (it expects a page title), so
        // every section heading collides with the paragraph above it. Later h1s
        // become real h2s, which carry prose's `margin-top: 2em`.
        articleH1Count += 1
        if (articleH1Count > 1) Tag = 'h2'
      }

      const children = node.children ?? []
      const inline = children.filter((c) => !BLOCK_NODE_TYPES.has((c as { type?: string }).type ?? ''))
      const blocks = children.filter((c) => BLOCK_NODE_TYPES.has((c as { type?: string }).type ?? ''))

      // Only wrap when a block node is nested inside the heading. Wrapping every
      // heading in a <div> made each one a :first-child, which suppressed the
      // prose sibling margins that separate a heading from the text above it.
      if (blocks.length === 0) {
        return <Tag className={demotedClass}>{nodesToJSX({ nodes: inline })}</Tag>
      }

      return (
        <div>
          <Tag className={demotedClass}>{nodesToJSX({ nodes: inline })}</Tag>
          {nodesToJSX({ nodes: blocks })}
        </div>
      )
    },
    paragraph: ({ node, nodesToJSX }) => {
      // Lexical sometimes nests block-level nodes (headings, embedded blocks)
      // inside a paragraph node. <p> cannot legally contain those - the browser
      // auto-closes the tag and hydration desyncs - so fall back to <div> only
      // in that case. Emitting <p> for ordinary copy is what lets Tailwind's
      // `prose` apply line-height and paragraph spacing; when every paragraph
      // was a <div>, none of the prose body rules matched.
      const childNodes = node.children ?? []
      const hasBlockChild = childNodes.some((c) =>
        BLOCK_NODE_TYPES.has((c as { type?: string }).type ?? ''),
      )
      const Tag: keyof React.JSX.IntrinsicElements = hasBlockChild ? 'div' : 'p'

      const children = nodesToJSX({ nodes: node.children })
      const style: React.CSSProperties = {}
      if (node.format === 'center') style.textAlign = 'center'
      if (node.format === 'right') style.textAlign = 'right'
      if (node.format === 'left') style.textAlign = 'left'
      if (node.indent) style.paddingInlineStart = `${node.indent * 2}rem`

      return <Tag style={Object.keys(style).length > 0 ? style : undefined}>{children}</Tag>
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
  /** Article body: keep first Lexical h1 as &lt;h1&gt;; demote later h1 to semantic &lt;h2&gt;. */
  demoteExtraH1?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    demoteExtraHeroH1 = false,
    demoteExtraH1 = false,
    ...rest
  } = props

  const converters =
    demoteExtraHeroH1 || demoteExtraH1
      ? createJsxConverters(demoteExtraHeroH1, demoteExtraH1)
      : defaultJsxConverters

  return (
    <ConvertRichText
      converters={converters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          // Set size and leading together. `text-base` alone also sets
          // line-height: 1.5rem, which overrode prose's 1.75 and left 18px body
          // copy on a 24px line (1.33) - far too tight to read comfortably.
          'mx-auto prose prose-base prose-a:text-primary text-[1rem] leading-[1.7] md:text-[1.125rem] md:leading-[1.75]':
            enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
