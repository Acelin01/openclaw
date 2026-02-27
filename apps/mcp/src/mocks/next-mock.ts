
export default function Link({ children, ...props }: any) {
  return children;
}
export const useRouter = () => ({ push: () => {}, replace: () => {}, back: () => {}, prefetch: () => {} });
export const usePathname = () => '/';
export const useSearchParams = () => new URLSearchParams();
