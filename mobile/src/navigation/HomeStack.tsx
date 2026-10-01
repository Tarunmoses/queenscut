import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddItemScreen } from '../screens/createOrder/AddItemScreen';
import { CreateOrderProvider } from '../screens/createOrder/CreateOrderContext';
import { CreateOrderReviewScreen } from '../screens/createOrder/CreateOrderReviewScreen';
import { CreateOrderStep1Screen } from '../screens/createOrder/CreateOrderStep1Screen';
import { CreateOrderStep2Screen } from '../screens/createOrder/CreateOrderStep2Screen';
import { HomeScreen } from '../screens/HomeScreen';
import { ViewOrderScreen } from '../screens/ViewOrderScreen';

export type HomeStackParamList = {
  Home: undefined;
  CreateOrderStep1: undefined;
  CreateOrderStep2: undefined;
  AddItem: { editIndex?: number } | undefined;
  CreateOrderReview: undefined;
  ViewOrder: { orderId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <CreateOrderProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateOrderStep1" component={CreateOrderStep1Screen} />
        <Stack.Screen name="CreateOrderStep2" component={CreateOrderStep2Screen} />
        <Stack.Screen name="AddItem" component={AddItemScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="CreateOrderReview" component={CreateOrderReviewScreen} />
        <Stack.Screen name="ViewOrder" component={ViewOrderScreen} />
      </Stack.Navigator>
    </CreateOrderProvider>
  );
}
