import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mockModule = (moduleName: string, exports: any) => {
  const Module = require('module');
  const originalLoad = Module._load;
  Module._load = function (request: string, parent: any, isMain: boolean) {
    if (request === moduleName || request.includes(moduleName)) {
      return exports;
    }
    return originalLoad.apply(this, arguments);
  };
};

try {
  // @ts-ignore
  const React = { createElement: (type: any, props: any, ...children: any[]) => ({ type, props, children }) };
  const mockLink = ({ children, href, ...props }: any) => ({ type: 'a', props: { ...props, href }, children });
  
  mockModule('next/link', {
    default: mockLink,
    __esModule: true
  });
  
  const mockNavigation = {
    usePathname: () => '/',
    useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }),
    useSearchParams: () => new URLSearchParams(),
    __esModule: true
  };
  
  mockModule('next/navigation', mockNavigation);
  
  mockModule('next/router', {
    useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }),
    __esModule: true
  });
  
  mockModule('react-dom', {
    default: {},
    render: () => {},
    __esModule: true
  });
  
  console.log('[Mocks] Successfully set up mocks for Next.js components');
} catch (e) {
  console.error('[Mock Error] Failed to setup mocks:', e);
}
