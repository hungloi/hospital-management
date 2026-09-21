/**
 * Script tạo phòng bệnh cho các khoa nội trú
 * Chạy: npx tsx scripts/seed-rooms.ts
 *
 * Logic:
 * - Chỉ khoa CÓ nội trú (lưu bệnh nhân qua đêm) mới có phòng bệnh
 * - Khoa ngoại trú / chẩn đoán / hành chính KHÔNG có phòng bệnh
 * - Mỗi khoa nội trú: ~20 phòng (Normal + VIP + ICU nếu phù hợp)
 */
import { prisma } from '../src/lib/prisma';

// ═══ CẤU HÌNH PHÒNG CHO TỪNG KHOA ═══════════════════════════════════
// type: NORMAL | VIP | VVIP | ICU | ISOLATION | DELIVERY | SURGERY_PREP
// Chỉ khoa nội trú thực sự mới có phòng bệnh

type RoomConfig = {
  type: string;
  count: number;
  prefix: string;
  floor: number;
  capacity: number;
  rate: number;
  desc: string;
};

type DeptRoomSpec = {
  floorBase: number;
  rooms: RoomConfig[];
};

const DEPT_ROOMS: Record<string, DeptRoomSpec> = {
  // ─ Khoa Nội ──────────────────────────────────────────────────────────
  'Khoa Nội': {
    floorBase: 2,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'N', floor: 2, capacity: 4, rate: 150000,  desc: 'Phòng thường - Nội khoa' },
      { type: 'VIP',       count: 5,  prefix: 'N', floor: 3, capacity: 2, rate: 450000,  desc: 'Phòng VIP - Nội khoa' },
      { type: 'VVIP',      count: 3,  prefix: 'N', floor: 3, capacity: 1, rate: 800000,  desc: 'Phòng VVIP - Nội khoa' },
      { type: 'ISOLATION', count: 2,  prefix: 'N', floor: 2, capacity: 1, rate: 350000,  desc: 'Phòng cách ly - Nội khoa' },
    ],
  },
  // ─ Khoa Ngoại ────────────────────────────────────────────────────────
  'Khoa Ngoại': {
    floorBase: 4,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'NG', floor: 4, capacity: 4, rate: 200000,  desc: 'Phòng thường - Ngoại khoa' },
      { type: 'VIP',       count: 5,  prefix: 'NG', floor: 5, capacity: 2, rate: 500000,  desc: 'Phòng VIP - Ngoại khoa' },
      { type: 'VVIP',      count: 3,  prefix: 'NG', floor: 5, capacity: 1, rate: 900000,  desc: 'Phòng VVIP - Ngoại khoa' },
      { type: 'NORMAL',    count: 2,  prefix: 'NG', floor: 4, capacity: 2, rate: 200000,  desc: 'Phòng hậu phẫu - Ngoại khoa' },
    ],
  },
  // ─ Khoa Sản Phụ Khoa ─────────────────────────────────────────────────
  'Khoa Sản Phụ Khoa': {
    floorBase: 6,
    rooms: [
      { type: 'DELIVERY',  count: 5,  prefix: 'S',  floor: 6, capacity: 2, rate: 500000,  desc: 'Phòng sinh - Khoa Sản' },
      { type: 'NORMAL',    count: 8,  prefix: 'S',  floor: 6, capacity: 4, rate: 200000,  desc: 'Phòng thường - Khoa Sản' },
      { type: 'VIP',       count: 4,  prefix: 'S',  floor: 7, capacity: 1, rate: 700000,  desc: 'Phòng VIP - Khoa Sản' },
      { type: 'ISOLATION', count: 2,  prefix: 'S',  floor: 6, capacity: 1, rate: 400000,  desc: 'Phòng sơ sinh biệt lập' },
      { type: 'VVIP',      count: 1,  prefix: 'S',  floor: 7, capacity: 1, rate: 1200000, desc: 'Suite phòng sinh VIP' },
    ],
  },
  // ─ Khoa Nhi ──────────────────────────────────────────────────────────
  'Khoa Nhi': {
    floorBase: 7,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'NH', floor: 7, capacity: 4, rate: 150000,  desc: 'Phòng thường - Nhi khoa' },
      { type: 'VIP',       count: 4,  prefix: 'NH', floor: 8, capacity: 2, rate: 450000,  desc: 'Phòng VIP - Nhi khoa' },
      { type: 'ISOLATION', count: 3,  prefix: 'NH', floor: 7, capacity: 1, rate: 350000,  desc: 'Phòng cách ly - Nhi' },
      { type: 'VVIP',      count: 2,  prefix: 'NH', floor: 8, capacity: 1, rate: 800000,  desc: 'Phòng VVIP - Nhi' },
      { type: 'NORMAL',    count: 1,  prefix: 'NH', floor: 7, capacity: 6, rate: 120000,  desc: 'Phòng sơ sinh' },
    ],
  },
  // ─ Khoa Cấp Cứu ──────────────────────────────────────────────────────
  'Khoa Cấp Cứu': {
    floorBase: 1,
    rooms: [
      { type: 'ICU',       count: 8,  prefix: 'CC', floor: 1, capacity: 1, rate: 1500000, desc: 'Giường cấp cứu hồi sức' },
      { type: 'NORMAL',    count: 8,  prefix: 'CC', floor: 1, capacity: 4, rate: 300000,  desc: 'Phòng lưu - Cấp cứu' },
      { type: 'ISOLATION', count: 4,  prefix: 'CC', floor: 1, capacity: 1, rate: 500000,  desc: 'Phòng cách ly cấp cứu' },
    ],
  },
  // ─ Khoa Hồi Sức Tích Cực (ICU) ────────────────────────────────────────
  'Khoa Hồi Sức Tích Cực (ICU)': {
    floorBase: 1,
    rooms: [
      { type: 'ICU',       count: 12, prefix: 'ICU', floor: 1, capacity: 1, rate: 2000000, desc: 'Giường ICU' },
      { type: 'ICU',       count: 4,  prefix: 'ICU', floor: 1, capacity: 1, rate: 2500000, desc: 'Giường ICU cách ly áp lực âm' },
      { type: 'NORMAL',    count: 4,  prefix: 'ICU', floor: 2, capacity: 2, rate: 800000,  desc: 'Phòng bước chân ra ICU' },
    ],
  },
  // ─ Khoa Hồi Sức Tích Cực Nhi (PICU) ──────────────────────────────────
  'Khoa Hồi Sức Tích Cực Nhi (PICU)': {
    floorBase: 1,
    rooms: [
      { type: 'ICU',       count: 8,  prefix: 'PICU', floor: 1, capacity: 1, rate: 2000000, desc: 'Giường PICU' },
      { type: 'ICU',       count: 4,  prefix: 'PICU', floor: 1, capacity: 1, rate: 1500000, desc: 'Lồng ấp sơ sinh nguy kịch' },
      { type: 'NORMAL',    count: 4,  prefix: 'PICU', floor: 2, capacity: 2, rate: 600000,  desc: 'Phòng hồi phục PICU' },
      { type: 'ISOLATION', count: 2,  prefix: 'PICU', floor: 1, capacity: 1, rate: 1000000, desc: 'Cách ly nhi nguy kịch' },
    ],
  },
  // ─ Khoa Gây Mê Hồi Sức ───────────────────────────────────────────────
  'Khoa Gây Mê Hồi Sức': {
    floorBase: 3,
    rooms: [
      { type: 'ICU',       count: 8,  prefix: 'GM',  floor: 3, capacity: 1, rate: 1200000, desc: 'Phòng hồi tỉnh sau mổ' },
      { type: 'NORMAL',    count: 8,  prefix: 'GM',  floor: 3, capacity: 2, rate: 400000,  desc: 'Phòng hồi phục mê' },
      { type: 'ISOLATION', count: 4,  prefix: 'GM',  floor: 3, capacity: 1, rate: 600000,  desc: 'Phòng hồi tỉnh cách ly' },
    ],
  },
  // ─ Khoa Tim Mạch ─────────────────────────────────────────────────────
  'Khoa Tim Mạch': {
    floorBase: 5,
    rooms: [
      { type: 'ICU',       count: 4,  prefix: 'TM',  floor: 5, capacity: 1, rate: 1800000, desc: 'Phòng ICU tim mạch (CCU)' },
      { type: 'NORMAL',    count: 10, prefix: 'TM',  floor: 5, capacity: 4, rate: 250000,  desc: 'Phòng thường - Tim mạch' },
      { type: 'VIP',       count: 4,  prefix: 'TM',  floor: 6, capacity: 2, rate: 600000,  desc: 'Phòng VIP - Tim mạch' },
      { type: 'VVIP',      count: 2,  prefix: 'TM',  floor: 6, capacity: 1, rate: 1100000, desc: 'Phòng VVIP - Tim mạch' },
    ],
  },
  // ─ Khoa Thần Kinh ────────────────────────────────────────────────────
  'Khoa Thần Kinh': {
    floorBase: 4,
    rooms: [
      { type: 'ICU',       count: 4,  prefix: 'TK',  floor: 4, capacity: 1, rate: 1500000, desc: 'Phòng ICU thần kinh (NCCU)' },
      { type: 'NORMAL',    count: 10, prefix: 'TK',  floor: 4, capacity: 4, rate: 200000,  desc: 'Phòng thường - Thần kinh' },
      { type: 'VIP',       count: 4,  prefix: 'TK',  floor: 5, capacity: 2, rate: 500000,  desc: 'Phòng VIP - Thần kinh' },
      { type: 'VVIP',      count: 2,  prefix: 'TK',  floor: 5, capacity: 1, rate: 950000,  desc: 'Phòng VVIP - Thần kinh' },
    ],
  },
  // ─ Khoa Hô Hấp ───────────────────────────────────────────────────────
  'Khoa Hô Hấp': {
    floorBase: 3,
    rooms: [
      { type: 'ISOLATION', count: 5,  prefix: 'HH',  floor: 3, capacity: 1, rate: 450000,  desc: 'Phòng cách ly hô hấp' },
      { type: 'NORMAL',    count: 10, prefix: 'HH',  floor: 3, capacity: 4, rate: 200000,  desc: 'Phòng thường - Hô hấp' },
      { type: 'VIP',       count: 4,  prefix: 'HH',  floor: 4, capacity: 2, rate: 500000,  desc: 'Phòng VIP - Hô hấp' },
      { type: 'ICU',       count: 1,  prefix: 'HH',  floor: 3, capacity: 1, rate: 1500000, desc: 'Phòng thở máy hô hấp' },
    ],
  },
  // ─ Khoa Tiêu Hóa ─────────────────────────────────────────────────────
  'Khoa Tiêu Hóa': {
    floorBase: 4,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'TH',  floor: 4, capacity: 4, rate: 180000,  desc: 'Phòng thường - Tiêu hóa' },
      { type: 'VIP',       count: 5,  prefix: 'TH',  floor: 5, capacity: 2, rate: 480000,  desc: 'Phòng VIP - Tiêu hóa' },
      { type: 'VVIP',      count: 3,  prefix: 'TH',  floor: 5, capacity: 1, rate: 850000,  desc: 'Phòng VVIP - Tiêu hóa' },
      { type: 'ISOLATION', count: 2,  prefix: 'TH',  floor: 4, capacity: 1, rate: 380000,  desc: 'Phòng cách ly tiêu hóa' },
    ],
  },
  // ─ Khoa Tiêu Hóa - Gan Mật Tụy ──────────────────────────────────────
  'Khoa Tiêu Hóa - Gan Mật Tụy': {
    floorBase: 5,
    rooms: [
      { type: 'NORMAL',    count: 8,  prefix: 'GMT', floor: 5, capacity: 4, rate: 200000,  desc: 'Phòng thường - Gan Mật Tụy' },
      { type: 'VIP',       count: 4,  prefix: 'GMT', floor: 6, capacity: 2, rate: 500000,  desc: 'Phòng VIP - Gan Mật Tụy' },
      { type: 'VVIP',      count: 3,  prefix: 'GMT', floor: 6, capacity: 1, rate: 900000,  desc: 'Phòng VVIP - Gan Mật Tụy' },
      { type: 'ISOLATION', count: 3,  prefix: 'GMT', floor: 5, capacity: 1, rate: 400000,  desc: 'Phòng cách ly gan' },
      { type: 'ICU',       count: 2,  prefix: 'GMT', floor: 5, capacity: 1, rate: 1500000, desc: 'Phòng ICU gan mật' },
    ],
  },
  // ─ Khoa Thận - Tiết Niệu ─────────────────────────────────────────────
  'Khoa Thận - Tiết Niệu': {
    floorBase: 6,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'TN',  floor: 6, capacity: 4, rate: 200000,  desc: 'Phòng thường - Thận tiết niệu' },
      { type: 'VIP',       count: 5,  prefix: 'TN',  floor: 7, capacity: 2, rate: 500000,  desc: 'Phòng VIP - Thận tiết niệu' },
      { type: 'VVIP',      count: 3,  prefix: 'TN',  floor: 7, capacity: 1, rate: 900000,  desc: 'Phòng VVIP - Thận tiết niệu' },
      { type: 'NORMAL',    count: 2,  prefix: 'TN',  floor: 6, capacity: 2, rate: 250000,  desc: 'Phòng lọc máu hàng ngày' },
    ],
  },
  // ─ Khoa Nội Tiết ─────────────────────────────────────────────────────
  'Khoa Nội Tiết': {
    floorBase: 5,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'NT',  floor: 5, capacity: 4, rate: 180000,  desc: 'Phòng thường - Nội tiết' },
      { type: 'VIP',       count: 5,  prefix: 'NT',  floor: 6, capacity: 2, rate: 450000,  desc: 'Phòng VIP - Nội tiết' },
      { type: 'VVIP',      count: 3,  prefix: 'NT',  floor: 6, capacity: 1, rate: 850000,  desc: 'Phòng VVIP - Nội tiết' },
      { type: 'ISOLATION', count: 2,  prefix: 'NT',  floor: 5, capacity: 1, rate: 350000,  desc: 'Phòng biệt lập thyroid' },
    ],
  },
  // ─ Khoa Huyết Học ────────────────────────────────────────────────────
  'Khoa Huyết Học': {
    floorBase: 4,
    rooms: [
      { type: 'ISOLATION', count: 6,  prefix: 'HHoc', floor: 4, capacity: 1, rate: 500000,  desc: 'Phòng vô khuẩn - Ghép tủy' },
      { type: 'NORMAL',    count: 8,  prefix: 'HHoc', floor: 4, capacity: 4, rate: 200000,  desc: 'Phòng thường - Huyết học' },
      { type: 'VIP',       count: 4,  prefix: 'HHoc', floor: 5, capacity: 2, rate: 500000,  desc: 'Phòng VIP - Huyết học' },
      { type: 'VVIP',      count: 2,  prefix: 'HHoc', floor: 5, capacity: 1, rate: 900000,  desc: 'Phòng VVIP - Huyết học' },
    ],
  },
  // ─ Khoa Ung Bướu ─────────────────────────────────────────────────────
  'Khoa Ung Bướu': {
    floorBase: 7,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'UB',  floor: 7, capacity: 4, rate: 250000,  desc: 'Phòng điều trị - Ung bướu' },
      { type: 'VIP',       count: 5,  prefix: 'UB',  floor: 8, capacity: 2, rate: 600000,  desc: 'Phòng VIP - Ung bướu' },
      { type: 'VVIP',      count: 3,  prefix: 'UB',  floor: 8, capacity: 1, rate: 1100000, desc: 'Phòng VVIP - Ung bướu' },
      { type: 'ISOLATION', count: 2,  prefix: 'UB',  floor: 7, capacity: 1, rate: 550000,  desc: 'Phòng cách ly hóa trị' },
    ],
  },
  // ─ Khoa Cơ Xương Khớp ───────────────────────────────────────────────
  'Khoa Cơ Xương Khớp': {
    floorBase: 5,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'CXK', floor: 5, capacity: 4, rate: 180000,  desc: 'Phòng thường - Cơ xương khớp' },
      { type: 'VIP',       count: 5,  prefix: 'CXK', floor: 6, capacity: 2, rate: 450000,  desc: 'Phòng VIP - Cơ xương khớp' },
      { type: 'VVIP',      count: 3,  prefix: 'CXK', floor: 6, capacity: 1, rate: 850000,  desc: 'Phòng VVIP - Cơ xương khớp' },
      { type: 'NORMAL',    count: 2,  prefix: 'CXK', floor: 5, capacity: 2, rate: 200000,  desc: 'Phòng vật lý trị liệu' },
    ],
  },
  // ─ Khoa Chấn Thương Chỉnh Hình ───────────────────────────────────────
  'Khoa Chấn Thương Chỉnh Hình': {
    floorBase: 3,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'CT',  floor: 3, capacity: 4, rate: 200000,  desc: 'Phòng thường - Chấn thương' },
      { type: 'VIP',       count: 5,  prefix: 'CT',  floor: 4, capacity: 2, rate: 500000,  desc: 'Phòng VIP - Chấn thương' },
      { type: 'VVIP',      count: 3,  prefix: 'CT',  floor: 4, capacity: 1, rate: 950000,  desc: 'Phòng VVIP - Chấn thương' },
      { type: 'NORMAL',    count: 2,  prefix: 'CT',  floor: 3, capacity: 2, rate: 250000,  desc: 'Phòng kéo nắn xương' },
    ],
  },
  // ─ Khoa Tâm Thần ─────────────────────────────────────────────────────
  'Khoa Tâm Thần': {
    floorBase: 8,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'TT',  floor: 8, capacity: 4, rate: 180000,  desc: 'Phòng điều trị - Tâm thần' },
      { type: 'VIP',       count: 4,  prefix: 'TT',  floor: 9, capacity: 2, rate: 450000,  desc: 'Phòng VIP - Tâm thần' },
      { type: 'ISOLATION', count: 4,  prefix: 'TT',  floor: 8, capacity: 1, rate: 400000,  desc: 'Phòng cách ly kích động' },
      { type: 'VVIP',      count: 2,  prefix: 'TT',  floor: 9, capacity: 1, rate: 850000,  desc: 'Phòng VVIP - Tâm thần' },
    ],
  },
  // ─ Khoa Tâm Thần - Tâm Lý ────────────────────────────────────────────
  'Khoa Tâm Thần - Tâm Lý': {
    floorBase: 9,
    rooms: [
      { type: 'NORMAL',    count: 8,  prefix: 'TL',  floor: 9, capacity: 4, rate: 200000,  desc: 'Phòng điều trị - Tâm lý' },
      { type: 'VIP',       count: 4,  prefix: 'TL',  floor: 9, capacity: 1, rate: 500000,  desc: 'Phòng VIP - Tâm lý trị liệu' },
      { type: 'ISOLATION', count: 4,  prefix: 'TL',  floor: 9, capacity: 1, rate: 400000,  desc: 'Phòng cách ly hành vi' },
      { type: 'NORMAL',    count: 4,  prefix: 'TL',  floor: 9, capacity: 2, rate: 250000,  desc: 'Phòng thư giãn trị liệu' },
    ],
  },
  // ─ Khoa Truyền Nhiễm ─────────────────────────────────────────────────
  'Khoa Truyền Nhiễm': {
    floorBase: 2,
    rooms: [
      { type: 'ISOLATION', count: 10, prefix: 'TrN', floor: 2, capacity: 1, rate: 500000,  desc: 'Phòng cách ly truyền nhiễm' },
      { type: 'ISOLATION', count: 4,  prefix: 'TrN', floor: 2, capacity: 1, rate: 700000,  desc: 'Phòng áp lực âm truyền nhiễm' },
      { type: 'NORMAL',    count: 4,  prefix: 'TrN', floor: 3, capacity: 4, rate: 200000,  desc: 'Phòng thường - Truyền nhiễm' },
      { type: 'ICU',       count: 2,  prefix: 'TrN', floor: 2, capacity: 1, rate: 1800000, desc: 'Phòng ICU cách ly truyền nhiễm' },
    ],
  },
  // ─ Khoa Phục Hồi Chức Năng ───────────────────────────────────────────
  'Khoa Phục Hồi Chức Năng': {
    floorBase: 3,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'PH',  floor: 3, capacity: 4, rate: 180000,  desc: 'Phòng điều trị - PHCN' },
      { type: 'VIP',       count: 5,  prefix: 'PH',  floor: 4, capacity: 2, rate: 450000,  desc: 'Phòng VIP - PHCN' },
      { type: 'VVIP',      count: 3,  prefix: 'PH',  floor: 4, capacity: 1, rate: 850000,  desc: 'Phòng VVIP - PHCN' },
      { type: 'NORMAL',    count: 2,  prefix: 'PH',  floor: 3, capacity: 1, rate: 300000,  desc: 'Phòng thủy trị liệu' },
    ],
  },
  // ─ Khoa Y Học Cổ Truyền ──────────────────────────────────────────────
  'Khoa Y Học Cổ Truyền': {
    floorBase: 2,
    rooms: [
      { type: 'NORMAL',    count: 8,  prefix: 'YHCT', floor: 2, capacity: 4, rate: 150000,  desc: 'Phòng điều trị - YHCT' },
      { type: 'VIP',       count: 4,  prefix: 'YHCT', floor: 3, capacity: 2, rate: 400000,  desc: 'Phòng VIP - YHCT' },
      { type: 'VVIP',      count: 3,  prefix: 'YHCT', floor: 3, capacity: 1, rate: 750000,  desc: 'Phòng VVIP - YHCT' },
      { type: 'NORMAL',    count: 5,  prefix: 'YHCT', floor: 2, capacity: 1, rate: 200000,  desc: 'Phòng châm cứu trị liệu' },
    ],
  },
  // ─ Khoa Da Liễu - Thẩm Mỹ ────────────────────────────────────────────
  'Khoa Da Liễu - Thẩm Mỹ': {
    floorBase: 5,
    rooms: [
      { type: 'NORMAL',    count: 8,  prefix: 'DL',  floor: 5, capacity: 2, rate: 200000,  desc: 'Phòng điều trị - Da liễu' },
      { type: 'VIP',       count: 5,  prefix: 'DL',  floor: 6, capacity: 1, rate: 550000,  desc: 'Phòng VIP - Da liễu thẩm mỹ' },
      { type: 'VVIP',      count: 3,  prefix: 'DL',  floor: 6, capacity: 1, rate: 1000000, desc: 'Phòng VVIP - Thẩm mỹ' },
      { type: 'ISOLATION', count: 4,  prefix: 'DL',  floor: 5, capacity: 1, rate: 400000,  desc: 'Phòng cách ly da liễu' },
    ],
  },
  // ─ Khoa Phẫu Thuật Lồng Ngực ─────────────────────────────────────────
  'Khoa Phẫu Thuật Lồng Ngực': {
    floorBase: 4,
    rooms: [
      { type: 'ICU',       count: 4,  prefix: 'LN',  floor: 4, capacity: 1, rate: 2000000, desc: 'Phòng ICU hậu mổ lồng ngực' },
      { type: 'NORMAL',    count: 8,  prefix: 'LN',  floor: 4, capacity: 4, rate: 250000,  desc: 'Phòng thường - Lồng ngực' },
      { type: 'VIP',       count: 4,  prefix: 'LN',  floor: 5, capacity: 2, rate: 600000,  desc: 'Phòng VIP - Lồng ngực' },
      { type: 'VVIP',      count: 2,  prefix: 'LN',  floor: 5, capacity: 1, rate: 1100000, desc: 'Phòng VVIP - Lồng ngực' },
      { type: 'NORMAL',    count: 2,  prefix: 'LN',  floor: 4, capacity: 2, rate: 350000,  desc: 'Phòng hậu phẫu lồng ngực' },
    ],
  },
  // ─ Khoa Phẫu Thuật Mạch ──────────────────────────────────────────────
  'Khoa Phẫu Thuật Mạch': {
    floorBase: 4,
    rooms: [
      { type: 'ICU',       count: 4,  prefix: 'MM',  floor: 4, capacity: 1, rate: 2000000, desc: 'Phòng ICU hậu mổ mạch' },
      { type: 'NORMAL',    count: 8,  prefix: 'MM',  floor: 4, capacity: 4, rate: 250000,  desc: 'Phòng thường - Phẫu thuật mạch' },
      { type: 'VIP',       count: 4,  prefix: 'MM',  floor: 5, capacity: 2, rate: 600000,  desc: 'Phòng VIP - Phẫu thuật mạch' },
      { type: 'VVIP',      count: 2,  prefix: 'MM',  floor: 5, capacity: 1, rate: 1100000, desc: 'Phòng VVIP - Phẫu thuật mạch' },
      { type: 'NORMAL',    count: 2,  prefix: 'MM',  floor: 4, capacity: 2, rate: 350000,  desc: 'Phòng hậu phẫu mạch' },
    ],
  },
  // ─ Khoa Tiết Niệu - Nam Khoa ─────────────────────────────────────────
  'Khoa Tiết Niệu - Nam Khoa': {
    floorBase: 6,
    rooms: [
      { type: 'NORMAL',    count: 8,  prefix: 'TiN', floor: 6, capacity: 4, rate: 200000,  desc: 'Phòng thường - Tiết niệu' },
      { type: 'VIP',       count: 5,  prefix: 'TiN', floor: 7, capacity: 2, rate: 500000,  desc: 'Phòng VIP - Tiết niệu' },
      { type: 'VVIP',      count: 3,  prefix: 'TiN', floor: 7, capacity: 1, rate: 950000,  desc: 'Phòng VVIP - Tiết niệu' },
      { type: 'NORMAL',    count: 4,  prefix: 'TiN', floor: 6, capacity: 1, rate: 300000,  desc: 'Phòng hậu phẫu tiết niệu' },
    ],
  },
  // ─ Khoa Ngoại Tổng Hợp ───────────────────────────────────────────────
  'Khoa Ngoại Tổng Hợp': {
    floorBase: 4,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'NTH', floor: 4, capacity: 4, rate: 180000,  desc: 'Phòng thường - Ngoại tổng hợp' },
      { type: 'VIP',       count: 5,  prefix: 'NTH', floor: 5, capacity: 2, rate: 450000,  desc: 'Phòng VIP - Ngoại tổng hợp' },
      { type: 'VVIP',      count: 3,  prefix: 'NTH', floor: 5, capacity: 1, rate: 850000,  desc: 'Phòng VVIP - Ngoại tổng hợp' },
      { type: 'NORMAL',    count: 2,  prefix: 'NTH', floor: 4, capacity: 2, rate: 200000,  desc: 'Phòng hậu phẫu - Ngoại tổng hợp' },
    ],
  },
  // ─ Khoa Nội Tổng Hợp ─────────────────────────────────────────────────
  'Khoa Nội Tổng Hợp': {
    floorBase: 3,
    rooms: [
      { type: 'NORMAL',    count: 10, prefix: 'NNT', floor: 3, capacity: 4, rate: 160000,  desc: 'Phòng thường - Nội tổng hợp' },
      { type: 'VIP',       count: 5,  prefix: 'NNT', floor: 4, capacity: 2, rate: 420000,  desc: 'Phòng VIP - Nội tổng hợp' },
      { type: 'VVIP',      count: 3,  prefix: 'NNT', floor: 4, capacity: 1, rate: 800000,  desc: 'Phòng VVIP - Nội tổng hợp' },
      { type: 'ISOLATION', count: 2,  prefix: 'NNT', floor: 3, capacity: 1, rate: 350000,  desc: 'Phòng cách ly - Nội tổng hợp' },
    ],
  },
  // ─ Khoa Nhi Hô Hấp ────────────────────────────────────────────────────
  'Khoa Nhi Hô Hấp': {
    floorBase: 7,
    rooms: [
      { type: 'ISOLATION', count: 4,  prefix: 'NHH', floor: 7, capacity: 1, rate: 450000,  desc: 'Phòng cách ly nhi hô hấp' },
      { type: 'NORMAL',    count: 8,  prefix: 'NHH', floor: 7, capacity: 4, rate: 180000,  desc: 'Phòng thường - Nhi hô hấp' },
      { type: 'VIP',       count: 4,  prefix: 'NHH', floor: 8, capacity: 2, rate: 450000,  desc: 'Phòng VIP - Nhi hô hấp' },
      { type: 'ICU',       count: 2,  prefix: 'NHH', floor: 7, capacity: 1, rate: 1500000, desc: 'Phòng thở máy nhi' },
      { type: 'NORMAL',    count: 2,  prefix: 'NHH', floor: 7, capacity: 2, rate: 200000,  desc: 'Phòng lồng ấp nhi' },
    ],
  },
  // ─ Khoa Răng Hàm Mặt ─────────────────────────────────────────────────
  'Khoa Răng Hàm Mặt': {
    floorBase: 2,
    rooms: [
      { type: 'NORMAL',    count: 8,  prefix: 'RHM', floor: 2, capacity: 2, rate: 180000,  desc: 'Phòng điều trị - Răng hàm mặt' },
      { type: 'VIP',       count: 4,  prefix: 'RHM', floor: 3, capacity: 1, rate: 450000,  desc: 'Phòng VIP - Răng hàm mặt' },
      { type: 'VVIP',      count: 2,  prefix: 'RHM', floor: 3, capacity: 1, rate: 850000,  desc: 'Phòng VVIP - Răng hàm mặt' },
      { type: 'NORMAL',    count: 6,  prefix: 'RHM', floor: 2, capacity: 1, rate: 250000,  desc: 'Phòng hậu phẫu hàm mặt' },
    ],
  },
};

// Các khoa KHÔNG có phòng bệnh (ngoại trú hoặc kỹ thuật):
const NO_ROOMS_DEPTS = [
  'Khoa Chẩn Đoán Hình Ảnh',
  'Khoa Xét Nghiệm',
  'Khoa Siêu Âm Chẩn Đoán',
  'Khoa Điện Não',
  'Khoa Pháp Y - Giám Định Tư Pháp',
  'Khoa Phòng Chống Bệnh Tật',
  'Phòng Công Nghệ Thông Tin',
  'Phòng Kế Toán - Tài Chính',
  'Phòng Nhân Sự - Hành Chính',
  'Phòng Dược',
  'Phòng Dinh Dưỡng',
  'Phòng Quản Lý Chất Lượng',
  'Phòng Vệ Sinh - Khám Chữa Bệnh',
  'Phòng Đào Tạo - Nghiên Cứu Khoa Học',
  'Pool Điều Dưỡng',
  'Khoa Tai Mũi Họng', // chủ yếu ngoại trú
  'Khoa Mắt',
  'Khoa Nhãn',
  // Khoa Răng Hàm Mặt có nhập viện hậu phẫu - đã có phòng
];

async function main() {
  console.log('🔄 Tạo phòng bệnh cho các khoa nội trú...\n');

  // Xoá phòng cũ chưa gán khoa
  await prisma.room.deleteMany({ where: { departmentId: null } });
  console.log('🗑  Đã xoá phòng cũ chưa phân khoa\n');

  const allDepts = await prisma.department.findMany();
  const D: Record<string, { id: string; floor: string | null }> = {};
  allDepts.forEach((d: any) => { D[d.name] = { id: d.id, floor: d.floor }; });

  let totalRooms = 0;
  let coveredDepts = 0;

  for (const [deptName, spec] of Object.entries(DEPT_ROOMS)) {
    const dept = D[deptName];
    if (!dept) {
      console.log(`⚠️  Bỏ qua: "${deptName}" (không tìm thấy trong DB)`);
      continue;
    }

    // Đếm phòng hiện có
    const existing = await prisma.room.count({ where: { departmentId: dept.id } });
    if (existing > 0) {
      console.log(`⏭️  Bỏ qua "${deptName}" (đã có ${existing} phòng)`);
      continue;
    }

    console.log(`🏥 ${deptName}:`);
    let deptRooms = 0;
    
    for (const cfg of spec.rooms) {
      for (let i = 1; i <= cfg.count; i++) {
        const roomNum = String(cfg.floor * 100 + deptRooms + i).padStart(3, '0');
        const name = `Phòng ${cfg.prefix}${roomNum}`;
        await prisma.room.create({
          data: {
            name,
            type: cfg.type,
            status: 'AVAILABLE',
            floor: cfg.floor,
            capacity: cfg.capacity,
            ratePerDay: cfg.rate,
            description: cfg.desc,
            departmentId: dept.id,
          }
        });
        process.stdout.write('.');
      }
      deptRooms += cfg.count;
    }
    
    totalRooms += deptRooms;
    coveredDepts++;
    console.log(`\n   ✅ ${deptRooms} phòng\n`);
  }

  // Báo các khoa không có phòng
  console.log('\n📋 Khoa/Phòng KHÔNG tạo phòng bệnh (lý do hợp lý):');
  for (const name of NO_ROOMS_DEPTS) {
    console.log(`   🚫 ${name}`);
  }

  // Tổng kết
  const grandTotal = await prisma.room.count();
  console.log('\n' + '═'.repeat(60));
  console.log(`✅ HOÀN TẤT TẠO PHÒNG BỆNH!`);
  console.log(`   🏥 Số khoa được tạo phòng: ${coveredDepts}`);
  console.log(`   🛏️  Phòng tạo mới: ${totalRooms}`);
  console.log(`   📊 Tổng phòng trong hệ thống: ${grandTotal}`);
  console.log('═'.repeat(60));

  // Chi tiết theo loại
  const byType = await prisma.$queryRaw`SELECT type, COUNT(*) as cnt FROM Room GROUP BY type` as any[];
  console.log('\n📊 Phân loại phòng:');
  byType.forEach((r: any) => console.log(`   ${r.type}: ${r.cnt} phòng`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
