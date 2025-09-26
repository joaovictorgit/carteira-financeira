export const CardHeader = ({ children, className, ...props }: any) => (
  <div className={`p-0 space-y-1 ${className}`} {...props}>
    {children}
  </div>
);