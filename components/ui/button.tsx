import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg hover:from-gray-600 hover:to-gray-700 hover:shadow-xl border border-gray-600/20',
        destructive:
          'bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl border border-red-700/20 focus-visible:ring-red-700/50',
        outline:
          'border-2 border-gray-600 bg-gray-800/30 backdrop-blur-sm text-gray-300 shadow-lg hover:bg-gray-700/50 hover:border-gray-500 hover:text-white hover:shadow-xl',
        secondary:
          'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:from-gray-500 hover:to-gray-600 hover:shadow-xl border border-gray-500/20',
        ghost:
          'text-gray-400 hover:bg-gray-800/50 hover:text-white hover:shadow-md backdrop-blur-sm border border-transparent hover:border-gray-600/50',
        link: 'text-gray-400 underline-offset-4 hover:underline hover:text-gray-300',
      },
      size: {
        default: 'h-10 px-6 py-2 has-[>svg]:px-4',
        sm: 'h-8 rounded-md gap-1.5 px-4 has-[>svg]:px-3 text-xs',
        lg: 'h-12 rounded-md px-8 has-[>svg]:px-6 text-base',
        icon: 'size-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
