export const Card = ({ children, className, ...props }: any) => (
  <div className={`rounded-xl shadow-md p-4 bg-white border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);