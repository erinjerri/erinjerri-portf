import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-base font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        clear: '',
        default: '',
        icon: 'h-10 w-10 rounded-none p-0',
        lg: 'rounded-none px-8 py-3.5 text-lg',
        sm: 'rounded-none px-4 py-2 text-sm',
      },
      variant: {
        default:
          'rounded-none bg-primary px-6 py-3 text-white hover:bg-primary/90 hover:text-white focus-visible:bg-muted focus-visible:text-foreground active:bg-muted active:text-foreground',
        outline:
          'rounded-none border border-white/20 bg-white/5 px-6 py-3 text-foreground backdrop-blur-sm hover:bg-white/10 hover:text-foreground',
        link: 'h-auto min-h-0 rounded-none bg-transparent p-0 font-semibold text-primary underline-offset-4 hover:underline',
      },
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  className,
  size,
  variant,
  ref,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ size, variant }), className)} ref={ref} {...props} />
}

export { Button, buttonVariants }
