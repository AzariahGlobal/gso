import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

interface Order {
    id: number;
    order_id: string;
    product_name: string;
    image: string;
    quantity: string;
    order_amount: string;
    payment_method: string;
    payment_status: string;
}

const OrdersList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://globalseafarers.org/dashboard/api/seamen_services/orders_list.php?user_id=2');
                const data = await response.json();

                if (data.status === "1") {
                    setOrders(data.message);
                } else {
                    setError("Failed to fetch orders.");
                }
            } catch (err) {
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
    }

    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    const renderItem = ({ item }: { item: Order }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.details}>
                <Text style={styles.productName}>{item.product_name}</Text>
                <Text style={styles.text}>Qty: {item.quantity}</Text>
                <Text style={styles.text}>Price: {item.order_amount}</Text>
                <Text style={[styles.text, styles.paymentStatus]}>Payment: {item.payment_status}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Orders List</Text>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 10 },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center',marginTop: 50, color: '#333' },
    card: { flexDirection: 'row', backgroundColor: '#fff', marginTop: 20, borderRadius: 10, padding: 10, marginVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
    image: { width: 80, height: 80, borderRadius: 10 },
    details: { marginLeft: 15, flex: 1, justifyContent: 'center' },
    productName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    text: { fontSize: 14, color: '#555' },
    paymentStatus: { fontWeight: 'bold', color: 'red' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    error: { textAlign: 'center', color: 'red', fontSize: 16, marginTop: 20 },
});

export default OrdersList;