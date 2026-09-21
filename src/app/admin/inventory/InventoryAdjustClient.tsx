'use client';
import React from 'react';

export default function InventoryAdjustClient() {
  const [mode, setMode] = React.useState<'RECEIVE' | 'ADJUST'>('RECEIVE');
  const [itemType, setItemType] = React.useState<'MEDICINE' | 'SUPPLY'>('MEDICINE');
  const [type, setType] = React.useState('IN');
  const [medicineId, setMedicineId] = React.useState('');
  const [supplyId, setSupplyId] = React.useState('');
  const [supplierId, setSupplierId] = React.useState('');
  const [batchNo, setBatchNo] = React.useState('');
  const [manufacturingDate, setManufacturingDate] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [unitPrice, setUnitPrice] = React.useState(0);
  const [description, setDescription] = React.useState('');

  const [medicines, setMedicines] = React.useState<any[]>([]);
  const [supplies, setSupplies] = React.useState<any[]>([]);
  const [suppliers, setSuppliers] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const [m, s, supplierRes] = await Promise.all([
          fetch('/api/medicines').then(r => r.json()),
          fetch('/api/medical-supplies').then(r => r.json()),
          fetch('/api/admin/suppliers').then(r => r.json()),
        ]);
        setMedicines(m || []);
        setSupplies(s || []);
        setSuppliers(supplierRes || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const selectedItemId = itemType === 'MEDICINE' ? medicineId : supplyId;
    if (!selectedItemId) {
      alert('Vui lòng chọn thuốc hoặc vật tư');
      return;
    }

    if (mode === 'RECEIVE') {
      if (!supplierId || !batchNo || !expiryDate) {
        alert('Vui lòng nhập nhà cung cấp, số lô và hạn dùng khi nhập kho');
        return;
      }

      const payload: any = {
        type: itemType,
        itemId: selectedItemId,
        supplierId,
        batchNo,
        manufacturingDate,
        expiryDate,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        description,
      };

      const res = await fetch('/api/admin/inventory/receive', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Nhập kho thành công');
        window.location.reload();
      } else {
        alert(data.error || 'Lỗi khi nhập kho');
      }
      return;
    }

    const payload: any = {
      type,
      quantity: Number(quantity),
      description,
    };
    if (itemType === 'MEDICINE') payload.medicineId = selectedItemId;
    else payload.supplyId = selectedItemId;

    const res = await fetch('/api/inventory-logs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Cập nhật tồn kho thành công');
      window.location.reload();
    } else {
      alert(data.error || 'Lỗi');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: '0.85rem', fontSize: '0.95rem' }}>
      <label style={labelStyle}>Hình thức</label>
      <select value={mode} onChange={e => setMode(e.target.value as 'RECEIVE' | 'ADJUST')} style={controlStyle}>
        <option value="RECEIVE">Nhập kho từ nhà cung cấp</option>
        <option value="ADJUST">Điều chỉnh / xuất kho</option>
      </select>

      <label style={labelStyle}>Loại hàng</label>
      <select value={itemType} onChange={e => {
        setItemType(e.target.value as 'MEDICINE' | 'SUPPLY');
        setMedicineId('');
        setSupplyId('');
      }} style={controlStyle}>
        <option value="MEDICINE">Thuốc</option>
        <option value="SUPPLY">Vật tư</option>
      </select>

      {itemType === 'MEDICINE' ? (
        <>
          <label style={labelStyle}>Thuốc</label>
          <select value={medicineId} onChange={e => setMedicineId(e.target.value)} style={controlStyle}>
            <option value="">-- Chọn thuốc --</option>
            {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </>
      ) : (
        <>
          <label style={labelStyle}>Vật tư</label>
          <select value={supplyId} onChange={e => setSupplyId(e.target.value)} style={controlStyle}>
            <option value="">-- Chọn vật tư --</option>
            {supplies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </>
      )}

      {mode === 'RECEIVE' ? (
        <>
          <label style={labelStyle}>Nhà cung cấp</label>
          <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required style={controlStyle}>
            <option value="">-- Chọn nhà cung cấp --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label style={labelStyle}>Số lô</label>
          <input value={batchNo} onChange={e => setBatchNo(e.target.value)} required style={controlStyle} />

          <label style={labelStyle}>Ngày sản xuất</label>
          <input type="date" value={manufacturingDate} onChange={e => setManufacturingDate(e.target.value)} style={controlStyle} />

          <label style={labelStyle}>Hạn dùng</label>
          <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required style={controlStyle} />

          <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <label style={labelStyle}>Số lượng nhập</label>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} required style={controlStyle} />
            </div>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <label style={labelStyle}>Đơn giá nhập</label>
              <input type="number" min="0" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value) || 0)} style={controlStyle} />
            </div>
          </div>
        </>
      ) : (
        <>
          <label style={labelStyle}>Loại biến động</label>
          <select value={type} onChange={e => setType(e.target.value)} style={controlStyle}>
            <option value="IN">Nhập kho (IN)</option>
            <option value="OUT">Xuất kho (OUT)</option>
            <option value="ADJUSTMENT">Điều chỉnh (ADJUSTMENT)</option>
            <option value="EXPIRED">Hết hạn (EXPIRED)</option>
          </select>

          <label style={labelStyle}>Số lượng</label>
          <input type="number" min="0" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} required style={controlStyle} />
        </>
      )}

      <label style={labelStyle}>Mô tả / Tham chiếu</label>
      <input value={description} onChange={e => setDescription(e.target.value)} style={controlStyle} />

      <button type="submit" style={{ ...buttonStyle, marginTop: '0.5rem' }}>Ghi nhận</button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  color: '#0f172a',
  fontWeight: 600,
  fontSize: '0.95rem',
};

const controlStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  padding: '0.85rem 1rem',
  outline: 'none',
  fontSize: '0.95rem',
};

const buttonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '12px',
  padding: '0.95rem 1rem',
  background: '#ffffff',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer',
};
