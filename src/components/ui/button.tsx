import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[8px] text-base font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[#C6C6C6] disabled:text-primary/30 disabled:opacity-100',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        clear: '',
        default: 'h-10 px-4 py-2',
        icon: 'h-10 w-10',
        lg: 'h-11 rounded px-8',
        sm: 'h-9 rounded px-3',
      },
      variant: {
        default:
          'bg-[#1C8FDA] text-white hover:bg-[#95D5F6] hover:text-[#1C8FDA] focus-visible:bg-[#95D5F6] focus-visible:text-[#1C8FDA] active:bg-[#95D5F6] active:text-[#1C8FDA]',
        accent:
          'bg-[#37EDFF] text-[#0F172A] hover:bg-[#95D5F6] hover:text-[#0F172A] focus-visible:bg-[#95D5F6] focus-visible:text-[#0F172A] active:bg-[#95D5F6] active:text-[#0F172A]',
        light:
          'bg-white text-[#1C8FDA] hover:bg-[#EAF6FF] hover:text-[#1C8FDA] focus-visible:bg-[#EAF6FF] focus-visible:text-[#1C8FDA] active:bg-[#EAF6FF] active:text-[#1C8FDA]',
        inactive: 'bg-[#C6C6C6] text-primary/60 hover:bg-[#C6C6C6] hover:text-primary/60',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        filter:
          'border border-border bg-transparent text-muted-foreground hover:border-primary hover:text-primary',
        ghost: 'hover:bg-card hover:text-foreground',
        link: 'text-primary items-start justify-start underline-offset-4 hover:underline',
        outline:
          'border border-[#1C8FDA] bg-transparent text-[#1C8FDA] hover:bg-[#1C8FDA] hover:text-white',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
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
  return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />
}

export { Button, buttonVariants }
