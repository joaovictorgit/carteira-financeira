export const CardTitle = ({ children, className, ...props }: any) => (
  <h2 className={`text-2xl font-bold text-center ${className}`} {...props}>{children}</h2>
);