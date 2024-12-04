import SideNav from '@/app/ui/dashboard/sidenav';
import Header from '../ui/dashboard/header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-60">
        <SideNav />
      </div>
      
      <div className="flex-grow flex-row md:overflow-y-auto md:p-0">
        <div className='md:h-13'>
          <Header/>
        </div>
      <div className='mr-2'>
        {children}
      </div>
      </div>
    </div>
  );
}