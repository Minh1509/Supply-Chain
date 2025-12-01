# 📦 QR CODE SYSTEM - QUICK REFERENCE

## 🎯 OVERVIEW

Hệ thống tự động tạo QR code cho sellable items khi complete ManufactureOrder.

---

## 🔑 KEY CONCEPTS

**BatchNo:** String.valueOf(moId) - Link products với MO  
**isSellable:** Boolean flag trên Item - Đánh dấu hàng bán  
**Product Status:** PRODUCED → IN_WAREHOUSE → ISSUED → SOLD  
**QR Format:** "PRODUCT-{productId}-{serialNumber}"

---

## 📋 MAIN ENDPOINTS

### **Complete MO**

```
PUT /api/v1/manufacture-order/:moId/complete
Body: { completedQuantity: 100 }
→ Auto tạo products nếu isSellable = true
```

### **Get Products by Batch**

```
GET /api/v1/product/batch/:batchNo
→ List tất cả products trong batch
```

### **Download QR PDF**

```
GET /api/v1/product/batch/:batchNo/qr-pdf
→ PDF file với tất cả QR codes
```

### **Scan QR**

```
GET /api/v1/product/scan/:qrCode
→ Full product details
```

---

## 🔄 FLOW

```
1. Complete MO (completedQuantity: 100)
   ↓
2. Check Item.isSellable = true
   ↓
3. Auto create 100 Products với QR codes
   ↓
4. Download PDF → In ra → Dán lên sản phẩm
   ↓
5. Nhập kho → Update status: PRODUCED → IN_WAREHOUSE
   ↓
6. Scan QR → Xem thông tin
```

---

## 🗄️ DATABASE CHANGES

**ManufactureOrder:**

- `batch_no` VARCHAR(50) UNIQUE
- `completed_quantity` DOUBLE PRECISION
- `products_generated` BOOLEAN

**Product:**

- `status` VARCHAR(50)

---

## 📦 SERVICES MODIFIED

**Operation Service:**

- ManufactureOrderService.completeMO()
- EventPublisher.publishBatchCreateProducts()

**General Service:**

- ProductService.batchCreateProducts()
- ProductService.generateBatchQRCodesPDF()
- ProductService.scanQRCodeDetail()
- ProductService.updateBatchStatus()
- QRCodePDFGenerator (NEW)

**Inventory Service:**

- EventPublisher.publishProductBatchStatusUpdate()

---

## 🧪 QUICK TEST

```bash
# 1. Complete MO
curl -X PUT http://localhost:3000/api/v1/manufacture-order/1/complete \
  -H "Authorization: Bearer {token}" \
  -d '{"completedQuantity": 100}'

# 2. Get products
curl http://localhost:3000/api/v1/product/batch/1 \
  -H "Authorization: Bearer {token}"

# 3. Download PDF
curl http://localhost:3000/api/v1/product/batch/1/qr-pdf \
  -H "Authorization: Bearer {token}" \
  -o QR.pdf

# 4. Scan QR
curl http://localhost:3000/api/v1/product/scan/PRODUCT-1-A1B2C3D4 \
  -H "Authorization: Bearer {token}"
```

---

## ✅ CHECKLIST

**Backend:**

- [ ] Database migration
- [ ] ManufactureOrderService.completeMO()
- [ ] ProductService methods (6 methods)
- [ ] QRCodePDFGenerator
- [ ] EventPublisher methods
- [ ] Handlers & Listeners
- [ ] API Gateway endpoints

**Frontend:**

- [ ] MoService.completeMo()
- [ ] ProductService.downloadQRPDF()
- [ ] MoDetail: Complete MO logic
- [ ] ProductBatchList (đã có)
- [ ] ScanQR (đã có)
- [ ] QRCodeModal (đã có)

---

## 📚 FULL DOCUMENTATION

Xem file: `QR_CODE_SELLABLE_ITEMS_COMPLETE.md`
