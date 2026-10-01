import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StepProgress } from '../../components/StepProgress';
import { TextField } from '../../components/TextField';
import { colors, spacing } from '../../theme';
import { useCreateOrder } from './CreateOrderContext';

export function CreateOrderStep1Screen() {
  const navigation = useNavigation<any>();
  const { draft, setCustomer } = useCreateOrder();
  const [name, setName] = useState(draft.customerName);
  const [phone, setPhone] = useState(draft.customerPhone);
  const [deliveryDate, setDeliveryDate] = useState(draft.deliveryDate);

  const onNext = () => {
    if (!name || !phone || !deliveryDate) {
      Alert.alert('Missing details', 'Customer name, phone, and delivery date are required.');
      return;
    }
    setCustomer(name, phone, deliveryDate);
    navigation.navigate('CreateOrderStep2');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="New Order" dismiss="back" />
      <StepProgress step={1} total={3} label="Customer Details" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TextField label="Primary Customer Name *" value={name} onChangeText={setName} placeholder="e.g., Sarah" />
        <TextField
          label="Phone Number *"
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 XXXXX XXXXX"
          keyboardType="phone-pad"
        />
        <TextField
          label="Order Delivery Date *"
          value={deliveryDate}
          onChangeText={setDeliveryDate}
          placeholder="YYYY-MM-DD"
        />
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.footerBtn}>
          <Button label="Cancel" variant="secondary" onPress={() => navigation.popToTop()} />
        </View>
        <View style={styles.footerBtn}>
          <Button label="Next →" onPress={onNext} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.lg },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerBtn: { flex: 1 },
});
