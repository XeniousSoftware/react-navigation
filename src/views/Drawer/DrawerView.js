/* @flow */

import React, { PureComponent } from 'react';
import DrawerLayout from 'react-native-drawer-layout-polyfill';

import addNavigationHelpers from '../../addNavigationHelpers';
import DrawerSidebar from './DrawerSidebar';

import type {
  NavigationScreenProp,
  NavigationRoute,
  NavigationRouter,
  NavigationState,
  NavigationAction,
  NavigationDrawerScreenOptions,
  ViewStyleProp,
} from '../../TypeDefinition';

export type DrawerScene = {
  route: NavigationRoute,
  focused: boolean,
  index: number,
  tintColor?: string,
};

export type DrawerItem = {
  route: NavigationRoute,
  focused: boolean,
};

export type DrawerViewConfig = {
  drawerWidth: number,
  drawerPosition: 'left' | 'right',
  drawerOpenRoute: 'DrawerOpen' | string,
  drawerCloseRoute: 'DrawerClose' | string,
  contentComponent: ReactClass<*>,
  contentOptions?: {},
  style?: ViewStyleProp,
};

type Props = DrawerViewConfig & {
  screenProps?: {},
  router: NavigationRouter<
    NavigationState,
    NavigationAction,
    NavigationDrawerScreenOptions
  >,
  navigation: NavigationScreenProp<NavigationState, NavigationAction>,
};

/**
 * Component that renders the drawer.
 */
export default class DrawerView<T: *> extends PureComponent<void, Props, void> {
  props: Props;

  componentWillMount() {
    this._updateScreenNavigation(this.props.navigation);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      this.props.navigation.state.index !== nextProps.navigation.state.index
    ) {
      const { drawerOpenRoute } = this.props;
      const { routes, index } = nextProps.navigation.state;
      if (routes[index].routeName === drawerOpenRoute) {
        this._drawer.openDrawer();
      } else if (routes[index].routeName === 'DrawerToggle') {
        if (this._drawer.state.drawerShown) {
          this.props.navigation.navigate('DrawerClose');
        } else {
          this.props.navigation.navigate('DrawerOpen');
        }
      } else {
        this._drawer.closeDrawer();
      }
    }
    this._updateScreenNavigation(nextProps.navigation);
  }

  _screenNavigationProp: NavigationScreenProp<T, NavigationAction>;

  _handleDrawerOpen = () => {
    const { navigation, drawerOpenRoute } = this.props;
    const { routes, index } = navigation.state;
    if (routes[index].routeName !== drawerOpenRoute) {
      this.props.navigation.navigate(drawerOpenRoute);
    }
  };

  _handleDrawerClose = () => {
    const { navigation, drawerCloseRoute } = this.props;
    const { routes, index } = navigation.state;
    if (routes[index].routeName !== drawerCloseRoute) {
      this.props.navigation.navigate(drawerCloseRoute);
    }
  };

  _updateScreenNavigation = (
    navigation: NavigationScreenProp<NavigationState, NavigationAction>
  ) => {
    const { drawerCloseRoute } = this.props;
    const navigationState = navigation.state.routes.find(
      (route: *) => route.routeName === drawerCloseRoute
    );
    if (
      this._screenNavigationProp &&
      this._screenNavigationProp.state === navigationState
    ) {
      return;
    }
    this._screenNavigationProp = addNavigationHelpers({
      ...navigation,
      state: navigationState,
    });
  };

  _getNavigationState = (
    navigation: NavigationScreenProp<NavigationState, NavigationAction>
  ) => {
    const { drawerCloseRoute } = this.props;
    const navigationState = navigation.state.routes.find(
      (route: *) => route.routeName === drawerCloseRoute
    );
    return navigationState;
  };

  _renderNavigationView = () =>
    <DrawerSidebar
      screenProps={this.props.screenProps}
      navigation={this._screenNavigationProp}
      router={this.props.router}
      contentComponent={this.props.contentComponent}
      contentOptions={this.props.contentOptions}
      style={this.props.style}
    />;

  _drawer: any;

  render() {
    const DrawerScreen = this.props.router.getComponentForRouteName(
      this.props.drawerCloseRoute
    );
    return (
      <DrawerLayout
        ref={(c: *) => {
          this._drawer = c;
        }}
        drawerWidth={this.props.drawerWidth}
        onDrawerOpen={this._handleDrawerOpen}
        onDrawerClose={this._handleDrawerClose}
        renderNavigationView={this._renderNavigationView}
        drawerPosition={
          this.props.drawerPosition === 'right'
            ? DrawerLayout.positions.Right
            : DrawerLayout.positions.Left
        }
      >
        <DrawerScreen
          screenProps={this.props.screenProps}
          navigation={this._screenNavigationProp}
        />
      </DrawerLayout>
    );
  }
}
