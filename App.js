import 'react-native-gesture-handler'; // 必须在文件的最顶部
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 新增导入
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import FeedScreen from './src/screens/FeedScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import TodoListScreen from './src/screens/TodoListScreen';
import NotesScreen from './src/screens/NotesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createMaterialBottomTabNavigator();

function MainApp() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="#007bff" // Example active color
      inactiveColor="#95a5a6" // Example inactive color
      barStyle={{ backgroundColor: '#ffffff' }} // Example bar background color
      shifting={false} // Set to true for shifting effect if desired
      labeled={true} // Ensure labels are visible
      sceneAnimationEnabled={true} // Enable scene animations for smoother transitions
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: '动态',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="newspaper-variant-multiple-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: '通知',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bell" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="TodoList"
        component={TodoListScreen}
        options={{
          tabBarLabel: '待办事项',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="format-list-checks" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          tabBarLabel: '笔记',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="note-multiple-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '设置',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 配置通知处理器，决定应用在前台时如何处理通知
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 显示横幅
    shouldPlaySound: true, // 播放声音
    shouldSetBadge: false, // 是否设置角标
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  // Learn more about Push Notifications at https://docs.expo.dev/push-notifications/overview/
  // token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
  // console.log(token); // 可以将 token 发送到服务器

  return token;
}

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();

    // 监听收到的通知
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // 监听用户对通知的响应（例如点击通知）
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      // 在这里可以根据 response.notification.request.content.data 进行导航或其他操作
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <MainApp />
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView> 
  );
}
