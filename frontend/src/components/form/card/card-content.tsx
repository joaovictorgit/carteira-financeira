export const CardContent = ({ children, className, ...props }: any) => (
  <div className={`p-0 pt-6 ${className}`} {...props}>
    {children}
  </div>
);