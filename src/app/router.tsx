import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { NewEventPage } from '../pages/NewEventPage';
import { HistoryPage } from '../pages/HistoryPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/new',
    element: <NewEventPage />,
  },
  {
    path: '/history',
    element: <HistoryPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}