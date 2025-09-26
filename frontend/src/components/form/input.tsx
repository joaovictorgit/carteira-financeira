export const Input = ({ className, ...props }: any) => (
  <input
    className={`
      flex h-10 w-full rounded-md border text-sm px-3 py-2 mt-2
      border-[#e5e7eb]
      bg-[#fbfaff]
      focus-visible:outline-none 
      focus-visible:ring-2 
      focus-visible:ring-[#0476AE]
      focus-visible:ring-offset-2
      placeholder:text-muted-foreground 
      disabled:cursor-not-allowed 
      disabled:opacity-50
      ${className}
    `} 
    {...props} 
  />
);