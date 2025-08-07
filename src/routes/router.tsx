/* eslint-disable react-refresh/only-export-components */
import paths, { rootPaths } from './paths';
import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import MainLayout from 'layouts/main-layout';
import PageLoader from 'components/loader/PageLoader';
import AuthLayout from 'layouts/auth-layout';

const App = lazy(() => import('../App'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const KnowledgeList = lazy(() => import('../pages/knowledge/KnowledgeList'));
const KnowledgeView = lazy(() => import('../pages/knowledge/KnowledgeView'));
const KnowledgeCreate = lazy(() => import('../pages/knowledge/KnowledgeCreate'));
const SourcesList = lazy(() => import('../pages/sources/SourcesList'));
const SourceView = lazy(() => import('../pages/sources/SourceView'));
const SourceCreate = lazy(() => import('../pages/sources/SourceCreate'));
const SearchResults = lazy(() => import('../pages/search/SearchResults'));
const Signin = lazy(() => import('../pages/authentication/Signin'));
const Signup = lazy(() => import('../pages/authentication/Signup'));

const router = createBrowserRouter([
  {
    element: (
      <Suspense fallback={<PageLoader />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: '/',
        element: (
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </MainLayout>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: paths.knowledge,
            element: <KnowledgeList />,
          },
          {
            path: paths.knowledgeCreate,
            element: <KnowledgeCreate />,
          },
          {
            path: paths.knowledgeView,
            element: <KnowledgeView />,
          },
          {
            path: paths.sources,
            element: <SourcesList />,
          },
          {
            path: paths.sourcesCreate,
            element: <SourceCreate />,
          },
          {
            path: paths.sourcesView,
            element: <SourceView />,
          },
          {
            path: paths.search,
            element: <SearchResults />,
          },
          {
            path: paths.searchResults,
            element: <SearchResults />,
          },
        ],
      },
      {
        path: rootPaths.authRoot,
        element: (
          <AuthLayout>
            <Outlet />
          </AuthLayout>
        ),
        children: [
          {
            path: paths.signin,
            element: <Signin />,
          },
          {
            path: paths.signup,
            element: <Signup />,
          },
        ],
      },
    ],
  },
]);

export default router;
