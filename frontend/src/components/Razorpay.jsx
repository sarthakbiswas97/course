import { useState } from "react";
import axios from 'axios';

function Razorpay() {
    const [orderAmount, setOrderAmount] = useState("");
    const token = localStorage.getItem("token")
    const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

    const handleChange = (e) => {
        setOrderAmount(e.target.value)
    }

    const handlePayment = async(e) => {
        e.preventDefault()

        const orderResponse = await axios.post('/payment/create-order',{amount:orderAmount},{
            headers:{
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(orderResponse.data);
        const {amount,id} = orderResponse.data

        const options = {
            key: KEY_ID,
            amount: Number(amount),
            currency: "INR",
            name: "course-selling-app",
            order_id: id,
            handler: function(response){
                axios.post("/payment/verify",{
                    id: id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                },{
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            }
        }
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    }

    return (
        <>
            <form id="payment-form" onSubmit={handlePayment}>
                <label htmlFor="orderAmount">Amount:</label>
                <input type="number" id="orderAmount" value={orderAmount} onChange={handleChange} className="border border-black" required/>
                <button type="submit">PAY</button>
            </form>
        </>
    )
}

export default Razorpay