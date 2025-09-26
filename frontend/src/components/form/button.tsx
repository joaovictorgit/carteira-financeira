export const Button = ({ children, className, ...props }: any) => (
  <button className={`bg-primary text-white font-semibold py-2 px-4 rounded-md shadow transition-all cursor-pointer ${className}`} {...props}>
    {children}
  </button>
);