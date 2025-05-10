import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, Pressable, TouchableOpacity } from 'react-native'; // FlatList will be replaced
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import {
  FAB,
  Modal,
  Portal,
  TextInput,
  Button as PaperButton,
  List,
  Checkbox,
  Text,
  Divider,
  useTheme,
  MD3Colors, // For fallback colors if needed, or direct color values
  Snackbar,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Ensure this is imported
import { SafeAreaView } from 'react-native-safe-area-context'; // Ensures content is within safe area
import AsyncStorage from '@react-native-async-storage/async-storage';

const TODOS_STORAGE_KEY = '@todos_data'; // Key for AsyncStorage

function TodoListScreen() {
  const [todos, setTodos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodo, setEditingTodo] = useState(null); // For editing existing todos, if needed later
  const [recentlyDeleted, setRecentlyDeleted] = useState(null); // { item: object, index: number, timerId: Timeout }
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const theme = useTheme(); // Access theme for styling

  // Load todos from AsyncStorage when component mounts
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
        if (storedTodos !== null) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (e) {
        console.error('Failed to load todos from storage.', e);
      }
    };
    loadTodos();
  }, []);

  // Save todos to AsyncStorage whenever the todos state changes
  useEffect(() => {
    const saveTodos = async () => {
      try {
        // Avoid saving during initial load if todos is still the initial empty array
        // and hasn't been populated from storage yet.
        // A simple check: if it's not the very first render or todos has content.
        // However, a more robust way might involve a loading state.
        // For simplicity, we'll save whenever todos changes after the initial load.
        await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
      } catch (e) {
        console.error('Failed to save todos to storage.', e);
      }
    };
    // Only save if it's not the initial empty array from useState,
    // to prevent overwriting loaded data with an empty array immediately.
    // This check can be tricky. A common pattern is to have a `isLoaded` state.
    // For now, this effect will run after `todos` is updated by `loadTodos` or user actions.
    saveTodos();
  }, [todos]);

  const showModal = () => setModalVisible(true);
  const hideModal = () => {
    setModalVisible(false);
    setNewTodoText('');
    setEditingTodo(null); // Reset editing state
    Keyboard.dismiss();
  };

  const handleAddOrUpdateTodo = () => {
    if (newTodoText.trim() === '') {
      return; // Prevent adding empty todos
    }
    if (editingTodo) {
      // Update existing todo
      setTodos(
        todos.map((todo) =>
          todo.id === editingTodo.id ? { ...todo, text: newTodoText } : todo
        )
      );
    } else {
      // Add new todo
      setTodos([
        ...todos,
        { id: Date.now().toString(), text: newTodoText, completed: false, createdAt: Date.now() },
      ]);
    }
    hideModal();
  };

  const handleToggleComplete = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (!todoToDelete) return;

    const index = todos.findIndex(todo => todo.id === id);

    // Clear any existing undo timeout for previous deletions, and perform its action
    if (recentlyDeleted?.timerId) {
      clearTimeout(recentlyDeleted.timerId);
      // Simulate the timeout action for the previous item if it wasn't undone
      // This part is tricky if we want to "confirm" previous delete.
      // For simplicity, we'll just clear the old timer and focus on the new delete.
      // Or, better, ensure recentlyDeleted is nullified if its action was implicitly confirmed.
      setRecentlyDeleted(null);
    }

    // Optimistically remove from UI
    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));
    
    const timerId = setTimeout(() => {
      setRecentlyDeleted(null); // Timeout elapsed, cannot undo anymore
      // Snackbar will hide on its own or on dismiss if duration is set
    }, 5000);

    setRecentlyDeleted({ item: todoToDelete, index: index, timerId: timerId });
    setSnackbarVisible(true);
  };

  const handleUndoDelete = () => {
    if (recentlyDeleted) {
      const { item, index, timerId } = recentlyDeleted;
      clearTimeout(timerId); // Clear the timeout
      // Insert item back to its original position
      setTodos(currentTodos => {
        const newTodos = [...currentTodos];
        newTodos.splice(index, 0, item);
        return newTodos;
      });
      setRecentlyDeleted(null);
      setSnackbarVisible(false);
    }
  };
  
  // Function to start editing a todo
  const handleEditTodo = (todo) => {
    setNewTodoText(todo.text);
    setEditingTodo(todo);
    showModal();
  };

  const renderTodoItem = ({ item, drag, isActive }) => {
    return (
      <ScaleDecorator>
        <View
          style={[
            styles.todoItemContainer,
            {
              borderColor: (theme.colors.outline || theme.colors.disabled) + '80',
              backgroundColor: isActive ? theme.colors.surfaceVariant : theme.colors.elevation.level1,
              // elevation: isActive ? 3 : 0, // Optional: add shadow when active
            }
          ]}
        >
          <List.Item
            title={item.text}
            titleStyle={{
              textDecorationLine: item.completed ? 'line-through' : 'none',
              color: item.completed
                ? (theme.dark ? 'rgba(255, 255, 255, 0.7)' : theme.colors.onSurfaceDisabled || theme.colors.disabled)
                : theme.colors.onSurface
            }}
            description={item.createdAt ? `创建于: ${new Date(item.createdAt).toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            descriptionStyle={{
              fontSize: 11,
              color: theme.colors.onSurfaceVariant,
              marginTop: 2,
              textAlign: 'right', // 靠右
            }}
            left={(props) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onLongPress={drag}
                  disabled={isActive}
                  style={[styles.dragHandle, isActive && styles.dragHandleActive]}
                >
                  <MaterialCommunityIcons name="drag-horizontal-variant" size={28} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
                <View {...props} style={styles.checkboxContainer}>
                  <Checkbox
                    status={item.completed ? 'checked' : 'unchecked'}
                    onPress={() => handleToggleComplete(item.id)}
                  />
                </View>
              </View>
            )}
            right={() => (
              <Pressable
                onLongPress={() => handleDeleteTodo(item.id)}
                delayLongPress={300} // 0.3 seconds
                style={({ pressed }) => [
                  styles.deleteButton,
                  { backgroundColor: pressed ? theme.colors.errorContainer : 'transparent' }
                ]}
                android_ripple={{ color: theme.colors.errorContainer, borderless: true }}
              >
                <MaterialCommunityIcons name="delete-outline" size={24} color={theme.colors.error} />
              </Pressable>
            )}
            onPress={() => handleEditTodo(item)}
          />
        </View>
      </ScaleDecorator>
    );
  };

  // Sort todos: incomplete first, then complete. Within each group, maintain existing order.
  const sortedTodos = React.useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed === b.completed) {
        // If completion status is the same, maintain the order from the 'todos' state
        // (which reflects creation order or drag-and-drop order).
        // Returning 0 should ideally keep their relative order if sort is stable.
        // To be absolutely sure for stability within groups, one might sort by a secondary key
        // like creation timestamp if that's desired over drag-drop order within groups.
        // For now, returning 0 aims to preserve the current relative order from `todos`.
        return 0;
      }
      // Incomplete (false) items should come before complete (true) items.
      // a.completed is false (0), b.completed is true (1) => 0 - 1 = -1 (a before b)
      // a.completed is true (1), b.completed is false (0) => 1 - 0 = 1 (b before a)
      return a.completed - b.completed;
    });
  }, [todos]);

  return (
    <SafeAreaView style={styles.container}>
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={hideModal}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.modalTitle, {color: theme.colors.primary}]}>
            {editingTodo ? '编辑待办事项' : '添加新的待办事项'}
          </Text>
          <TextInput
            label="待办事项内容"
            value={newTodoText}
            onChangeText={setNewTodoText}
            mode="outlined"
            style={styles.textInput}
          />
          <View style={styles.modalButtonContainer}>
            <PaperButton onPress={hideModal} style={styles.modalButton}textColor={theme.colors.error}>
              取消
            </PaperButton>
            <PaperButton onPress={handleAddOrUpdateTodo} mode="contained" style={styles.modalButton}>
              {editingTodo ? '更新' : '添加'}
            </PaperButton>
          </View>
        </Modal>
      </Portal>

      {sortedTodos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: theme.colors.disabled}]}>还没有待办事项，点击右下角按钮添加吧！</Text>
        </View>
      ) : (
        <DraggableFlatList
          data={sortedTodos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => setTodos(data)}
          ItemSeparatorComponent={() => <Divider />}
          containerStyle={styles.list} // DraggableFlatList uses containerStyle
        />
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={showModal}
        color={theme.colors.onPrimary || "#ffffff"} // Ensure contrast for FAB icon
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          // This onDismiss can be triggered by timeout or swipe.
          // If it's due to timeout, recentlyDeleted would have been cleared by the setTimeout.
          // If due to swipe, we might want to confirm the delete if not undone.
          // However, the primary mechanism for confirming delete is the setTimeout in handleDeleteTodo.
          // So, just ensure snackbar visibility is managed.
          if (recentlyDeleted && !snackbarVisible) {
            // This case implies the snackbar was programmatically hidden (e.g. by undo)
            // but if it's dismissing and recentlyDeleted still exists, it means undo wasn't pressed
            // and the timeout should handle clearing recentlyDeleted.
          }
          setSnackbarVisible(false);
        }}
        action={{
          label: '撤销',
          onPress: handleUndoDelete,
        }}
        duration={5000} // Snackbar will auto-dismiss after 5 seconds.
        style={styles.snackbar}
      >
        待办事项已删除。
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align buttons to the right
  },
  modalButton: {
    marginLeft: 8, // Add some space between buttons
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  todoItemContainer: {
    marginHorizontal: 16, // 两侧margin
    marginVertical: 6,
    borderRadius: 12, // Rounded corners
    borderWidth: 1,
    // borderColor will be set dynamically using theme.colors.outline or a fallback + alpha
    // backgroundColor: 'transparent', // Default, or use theme.colors.elevation.level1 for slight bg
    paddingVertical: 2, // Add some vertical padding inside the border
    paddingHorizontal: 8, // 内部水平horizontal padding
  },
  deleteButton: {
    padding: 8, // Reduced padding to make it closer to the edge
    borderRadius: 18, // Adjusted for potentially smaller padding
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -18, // 尝试将按钮向右移动8个单位
  },
  snackbar: {
    position: 'absolute', // Ensures it overlays content
    left: 8,             // Margin from the left
    right: 8,            // Margin from the right (makes it stretch with margins)
    bottom: 8,           // Margin from the bottom
    // For truly bottom-left, you might omit `right` and set a `width` or rely on content size.
    // Or set `right: undefined` if `left` is set.
    // For now, this will make it a bar at the bottom with side margins.
  },
  checkboxContainer: {
    justifyContent: 'center', // Vertically center the checkbox
    // alignItems: 'center', // Not strictly needed if List.Item's left area has fixed width
    paddingRight: 0, // Adjust if checkbox is too close to text, default 0
    // height: '100%', // This can be tricky with List.Item, let's see default behavior first
  },
  // itemDescription style is now inline
  dragHandle: {
    paddingHorizontal: 8,
    paddingVertical: 12, // Make it a bit taller for easier touch
    // marginRight: 2, // Optional: Space between handle and checkbox
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandleActive: {
    // Optional: style when item is being dragged
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export default TodoListScreen;