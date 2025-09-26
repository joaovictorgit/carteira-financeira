export const CardDescription = ({ children, className, ...props }: any) => (
  <p className={`text-sm text-center text-gray-500 ${className}`} {...props}>{children}</p>
);