import AdminLayout from '../admin/AdminLayout.jsx';
import AdminLogin from '../admin/AdminLogin.jsx';
import useAdminController from '../admin/useAdminController.js';
import useAdminNavigation from '../admin/useAdminNavigation.js';

import OverviewView from '../admin/OverviewView.jsx';
import ChatsView from './ChatView.jsx';
import PostsView from './PostView.jsx';
import BookingsView from './BookingsView.jsx';
import CommentsView from './CommentsView.jsx';
import SettingsView from './SettingsView.jsx';

import './view/AdminPage.css';

function AdminScreen({ route, navigate, goBack, controller }) {
  const sharedProps = {
    route,
    navigate,
    goBack,
    controller,
  };

  switch (route.section) {
    case 'chats':
      return <ChatsView {...sharedProps} />;

    case 'posts':
      return <PostsView {...sharedProps} />;

    case 'bookings':
      return <BookingsView {...sharedProps} />;

    case 'comments':
      return <CommentsView {...sharedProps} />;

    case 'settings':
      return <SettingsView {...sharedProps} />;

    case 'overview':
    default:
      return <OverviewView {...sharedProps} />;
  }
}

export default function AdminPage() {
  const navigation = useAdminNavigation();
  const controller = useAdminController(navigation.route);

  if (controller.booting || !controller.admin) {
    return (
      <AdminLogin
        booting={controller.booting}
        configured={controller.configured}
        error={controller.error}
        loginForm={controller.loginForm}
        setLoginForm={controller.setLoginForm}
        login={controller.login}
        saving={controller.saving}
      />
    );
  }

  return (
    <AdminLayout
      admin={controller.admin}
      route={navigation.route}
      navigate={navigation.navigate}
      goBack={navigation.goBack}
      canGoBack={navigation.canGoBack}
      getSectionBadge={controller.getSectionBadge}
      autoRefresh={controller.autoRefresh}
      setAutoRefresh={controller.setAutoRefresh}
      soundEnabled={controller.soundEnabled}
      toggleSound={controller.toggleSound}
      saving={controller.saving}
      refreshAll={controller.refreshAll}
      logout={controller.logout}
      message={controller.message}
      error={controller.error}
    >
      <AdminScreen
        route={navigation.route}
        navigate={navigation.navigate}
        goBack={navigation.goBack}
        controller={controller}
      />
    </AdminLayout>
  );
}
