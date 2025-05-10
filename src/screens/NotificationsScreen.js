import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

async function scheduleAppleReminderNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "健康提醒 🍎",
        body: '是时候吃个苹果啦！保持健康哦～',
        data: { type: 'health-reminder', item: 'apple' }, // 可以携带一些自定义数据
      },
      trigger: {
        seconds: 5, // 5秒后触发，方便测试
        // repeats: true, // 如果需要重复提醒
      },
    });
    Alert.alert("提醒已设置", "您将在5秒后收到一个吃苹果的提醒。");
  } catch (error) {
    console.error("设置提醒失败:", error);
    Alert.alert("设置失败", "无法设置提醒，请查看控制台获取更多信息。");
  }
}

function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>通知屏幕</Text>
      <Button
        mode="contained"
        onPress={scheduleAppleReminderNotification}
        style={styles.button}
      >
        提醒我5秒后吃苹果
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff9c4', // Different background for visual distinction
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  }
});

export default NotificationsScreen;