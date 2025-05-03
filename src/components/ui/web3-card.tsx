
import * as React from "react"
import { cn } from "@/lib/utils"

interface Web3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glass" | "accent"
  isActive?: boolean
  status?: "locked" | "active" | null
  statusValue?: string
}

const Web3Card = React.forwardRef<HTMLDivElement, Web3CardProps>(
  ({ className, variant = "default", isActive, status, statusValue, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl",
          {
            "bg-arena-card/70": variant === "default",
            "bg-gradient-to-br from-arena-card/90 to-arena-bg/90": variant === "gradient",
            "bg-white/5 backdrop-blur-lg": variant === "glass",
            "bg-gradient-to-br from-arena-accent/10 to-arena-accent2/10": variant === "accent",
            "border-arena-accent/30": isActive,
          },
          className
        )}
        {...props}
      >
        {status && (
          <div className={cn(
            "absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold",
            {
              "bg-arena-green/20 text-arena-green": status === "active",
              "bg-arena-red/20 text-arena-red": status === "locked",
            }
          )}>
            {status === "active" ? `Active: ${statusValue}` : "Locked"}
          </div>
        )}
        {props.children}
      </div>
    )
  }
)
Web3Card.displayName = "Web3Card"

const Web3CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4 border-b border-white/5 p-5", className)}
    {...props}
  />
))
Web3CardHeader.displayName = "Web3CardHeader"

const Web3CardIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-10 w-10 rounded-lg bg-gradient-to-br from-arena-accent/20 to-arena-accent2/20 flex items-center justify-center", className)}
    {...props}
  />
))
Web3CardIcon.displayName = "Web3CardIcon"

const Web3CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80", className)}
    {...props}
  />
))
Web3CardTitle.displayName = "Web3CardTitle"

const Web3CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
))
Web3CardContent.displayName = "Web3CardContent"

const Web3CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between border-t border-white/5 p-5", className)}
    {...props}
  />
))
Web3CardFooter.displayName = "Web3CardFooter"

export { Web3Card, Web3CardHeader, Web3CardIcon, Web3CardTitle, Web3CardContent, Web3CardFooter }
