import mongoose from "mongoose";
const Schema=mongoose.Schema

const trailSchema=new Schema({
    userId: {type:String,required: true},
    lastLogin: {type:String,required: true},
    scanDate: {type:String,required: true}
},
    {
        timestamps: true
    }
)

const orderSchema=new Schema({
    entity_id: {type: String,required: true},
    status: String,
    store_id: String,
    is_verified: {type: Boolean,required: true},
    trail: trailSchema,
    customer_id: String,
    reference_1: String,
    reference_2: String,
    order_date: String,
    due_date: String,
    shipment_date: String,
    discount_amount: String,
    grand_total: String,
    shipping_amount: String,
    subtotal: String,
    tax_amount: String,
    total_invoiced: String,
    total_paid: String,
    total_qty_ordered: String,
    billing_address_id: String,
    store_address_id: String,
    quote_id: String,
    shipping_address_id: String,
    subtotal_incl_tax: String,
    weight: String,
    volume: String,
    currency_code: String,
    salesperson: String,
    shiment_method_code: String,
    shipping_agent_code: String,
    shipping_agent_service: String,
    package_tracking_no: String,
    customer_email: String,
    customer_phone_no: String,
    customer_firstname: String,
    customer_lastname: String,
    customer_middlename: String,
    customer_prefix: String,
    customer_suffix: String,
    customer_taxvat: String,
    shipping_method: String,
    customer_note: String,
    created_at: String,
    updated_at: String,
    created_by: String,
    updated_by: String,
    warehouse_user_id: String,
    total_item_count: String,
    shipping_incl_tax: String,
    customer_shipping_date: String,
    warehouse_comments: String,
    customer_signature: String,
},{strict: false})

const Order=mongoose.model('Order',orderSchema) 
export default Order