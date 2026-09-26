import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

type DeptNode = { name: string; code: string; type: string; children?: DeptNode[] };

const structure: DeptNode[] = [
  // ── A. KHÁM BỆNH – TIẾP ĐÓN ──
  {
    name: "Khoa Khám bệnh", code: "KHOA_KHAM_BENH", type: "KHOA",
    children: [
      { name: "Khu tiếp đón", code: "KHU_TIEP_DON", type: "KHU" },
      { name: "Quầy đăng ký khám", code: "QUAY_DANG_KY", type: "KHU" },
      { name: "Quầy BHYT", code: "QUAY_BHYT", type: "KHU" },
      { name: "Quầy dịch vụ", code: "QUAY_DICH_VU", type: "KHU" },
      { name: "Quầy thanh toán", code: "QUAY_THANH_TOAN_KB", type: "KHU" },
      { name: "Khu chờ", code: "KHU_CHO_KHAM", type: "KHU" },
      { name: "Khu cấp số thứ tự", code: "KHU_CAP_STT", type: "KHU" },
      { name: "Phòng khám Nội tổng hợp", code: "PK_NOI_TONG_HOP", type: "PHONG_KHAM" },
      { name: "Phòng khám Tim mạch", code: "PK_TIM_MACH", type: "PHONG_KHAM" },
      { name: "Phòng khám Tiêu hóa - Gan mật", code: "PK_TIEU_HOA_GAN_MAT", type: "PHONG_KHAM" },
      { name: "Phòng khám Nội tiết", code: "PK_NOI_TIET", type: "PHONG_KHAM" },
      { name: "Phòng khám Thận - Tiết niệu", code: "PK_THAN_TIET_NIEU", type: "PHONG_KHAM" },
      { name: "Phòng khám Hô hấp", code: "PK_HO_HAP", type: "PHONG_KHAM" },
      { name: "Phòng khám Cơ - Xương - Khớp", code: "PK_CO_XUONG_KHOP", type: "PHONG_KHAM" },
      { name: "Phòng khám Thần kinh", code: "PK_THAN_KINH", type: "PHONG_KHAM" },
      { name: "Phòng khám Nhiệt đới & Truyền nhiễm", code: "PK_NHIET_DOI", type: "PHONG_KHAM" },
      { name: "Phòng khám Y học cổ truyền", code: "PK_YHCT", type: "PHONG_KHAM" },
      { name: "Phòng khám Phục hồi chức năng", code: "PK_PHCN", type: "PHONG_KHAM" },
      { name: "Phòng khám Lão khoa", code: "PK_LAO_KHOA", type: "PHONG_KHAM" },
      { name: "Phòng khám Ngoại tổng hợp", code: "PK_NGOAI_TONG_HOP", type: "PHONG_KHAM" },
      { name: "Phòng khám Ngoại Gan - Mật - Tụy", code: "PK_NGOAI_GMT", type: "PHONG_KHAM" },
      { name: "Phòng khám Ngoại Thần kinh", code: "PK_NGOAI_TK", type: "PHONG_KHAM" },
      { name: "Phòng khám Ngoại Lồng ngực - Mạch máu", code: "PK_NGOAI_LNMM", type: "PHONG_KHAM" },
      { name: "Phòng khám Ngoại Tiết niệu", code: "PK_NGOAI_TN", type: "PHONG_KHAM" },
      { name: "Phòng khám Chấn thương chỉnh hình", code: "PK_CTCH", type: "PHONG_KHAM" },
      { name: "Phòng khám Bỏng & Tạo hình", code: "PK_BONG_TH", type: "PHONG_KHAM" },
      { name: "Phòng khám Ung bướu", code: "PK_UNG_BUOU", type: "PHONG_KHAM" },
      { name: "Phòng khám Sản", code: "PK_SAN", type: "PHONG_KHAM" },
      { name: "Phòng khám Phụ khoa", code: "PK_PHU_KHOA", type: "PHONG_KHAM" },
      { name: "Phòng khám Nhi", code: "PK_NHI", type: "PHONG_KHAM" },
      { name: "Phòng khám Mắt", code: "PK_MAT", type: "PHONG_KHAM" },
      { name: "Phòng khám Tai - Mũi - Họng", code: "PK_TMH", type: "PHONG_KHAM" },
      { name: "Phòng khám Răng - Hàm - Mặt", code: "PK_RHM", type: "PHONG_KHAM" },
      { name: "Phòng khám Da liễu", code: "PK_DA_LIEU", type: "PHONG_KHAM" },
    ]
  },
  {
    name: "Khu Khám theo yêu cầu / Chuyên gia", code: "KHU_KHAM_TYC", type: "DON_VI",
    children: [
      { name: "Quầy tiếp đón theo yêu cầu", code: "QUAY_TD_TYC", type: "KHU" },
      { name: "Quầy thanh toán TYC", code: "QUAY_TT_TYC", type: "KHU" },
      { name: "Khu chờ theo yêu cầu", code: "KHU_CHO_TYC", type: "KHU" },
      { name: "Phòng khám chuyên gia", code: "PK_CHUYEN_GIA", type: "PHONG_KHAM" },
      { name: "Phòng khám VIP", code: "PK_VIP", type: "PHONG_KHAM" },
      { name: "Phòng khám dịch vụ cao cấp", code: "PK_DV_CAO_CAP", type: "PHONG_KHAM" },
    ]
  },
  // ── B. CẤP CỨU – HỒI SỨC ──
  {
    name: "Khoa Cấp cứu & Chống độc", code: "KHOA_CAP_CUU", type: "KHOA",
    children: [
      { name: "Khu tiếp nhận cấp cứu", code: "KHU_TN_CC", type: "KHU" },
      { name: "Khu phân loại cấp cứu", code: "KHU_PL_CC", type: "KHU" },
      { name: "Khu cấp cứu nội khoa", code: "KHU_CC_NK", type: "KHU" },
      { name: "Khu cấp cứu ngoại khoa", code: "KHU_CC_NGK", type: "KHU" },
      { name: "Khu chống độc", code: "KHU_CHONG_DOC", type: "KHU" },
      { name: "Khu theo dõi cấp cứu", code: "KHU_TD_CC", type: "KHU" },
    ]
  },
  {
    name: "Khu Cấp cứu lưu", code: "KHU_CC_LUU", type: "DON_VI",
    children: [
      { name: "Khu lưu bệnh nhân", code: "KHU_LUU_BN", type: "KHU" },
      { name: "Khu theo dõi ngắn hạn", code: "KHU_TD_NH", type: "KHU" },
      { name: "Khu theo dõi sau cấp cứu", code: "KHU_TD_SAU_CC", type: "KHU" },
    ]
  },
  {
    name: "Khoa Hồi sức tích cực (ICU)", code: "KHOA_ICU", type: "KHOA",
    children: [
      { name: "Khu hồi sức tích cực", code: "KHU_HSTC", type: "KHU" },
      { name: "Khu hồi sức bệnh nặng", code: "KHU_HSBN", type: "KHU" },
      { name: "Khu theo dõi đặc biệt", code: "KHU_TDDB", type: "KHU" },
      { name: "Khu hồi sức sau phẫu thuật", code: "KHU_HS_SAU_PT", type: "KHU" },
    ]
  },
  // ── C. NỘI KHOA ──
  { name: "Khoa Nội tổng hợp", code: "KHOA_NOI_TH", type: "KHOA", children: [
    { name: "Phòng khám Nội TH", code: "PK_NOI_TH_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị nội trú", code: "KDT_NOI_TH", type: "KHU" },
    { name: "Khu theo dõi bệnh nội khoa", code: "KTD_NOI_KHOA", type: "KHU" },
  ]},
  { name: "Khoa Nội Tim mạch & Can thiệp mạch", code: "KHOA_TIM_MACH", type: "KHOA", children: [
    { name: "Phòng khám Tim mạch", code: "PK_TIM_MACH_K", type: "PHONG_KHAM" },
    { name: "Đơn vị Tim mạch", code: "DV_TIM_MACH", type: "DON_VI" },
    { name: "Đơn vị Can thiệp mạch", code: "DV_CAN_THIEP", type: "DON_VI" },
    { name: "Phòng can thiệp", code: "PHONG_CAN_THIEP", type: "KHU" },
    { name: "Khu điều trị Tim mạch", code: "KDT_TIM_MACH", type: "KHU" },
    { name: "Khu theo dõi sau can thiệp", code: "KTD_SAU_CT", type: "KHU" },
  ]},
  { name: "Khoa Nội Tiêu hóa - Gan mật", code: "KHOA_TIEU_HOA", type: "KHOA", children: [
    { name: "Phòng khám Tiêu hóa", code: "PK_TIEU_HOA_K", type: "PHONG_KHAM" },
    { name: "Phòng khám Gan mật", code: "PK_GAN_MAT_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Tiêu hóa", code: "KDT_TIEU_HOA", type: "KHU" },
    { name: "Khu theo dõi Gan mật", code: "KTD_GAN_MAT", type: "KHU" },
  ]},
  { name: "Khoa Nội Tiết", code: "KHOA_NOI_TIET", type: "KHOA", children: [
    { name: "Phòng khám Nội tiết", code: "PK_NOI_TIET_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Nội tiết", code: "KDT_NOI_TIET", type: "KHU" },
    { name: "Khu theo dõi Nội tiết", code: "KTD_NOI_TIET", type: "KHU" },
  ]},
  { name: "Khoa Thận - Tiết niệu", code: "KHOA_THAN_TN", type: "KHOA", children: [
    { name: "Phòng khám Thận - Tiết niệu", code: "PK_THAN_TN_K", type: "PHONG_KHAM" },
    { name: "Đơn vị Thận học", code: "DV_THAN_HOC", type: "DON_VI" },
    { name: "Đơn vị Thận nhân tạo", code: "DV_THAN_NHAN_TAO", type: "DON_VI", children: [
      { name: "Khu chạy thận", code: "KHU_CHAY_THAN", type: "KHU" },
      { name: "Khu chuẩn bị lọc máu", code: "KHU_CB_LOC_MAU", type: "KHU" },
      { name: "Khu theo dõi sau lọc", code: "KHU_TD_SAU_LOC", type: "KHU" },
    ]},
    { name: "Khu điều trị Thận", code: "KDT_THAN", type: "KHU" },
  ]},
  { name: "Khoa Hô hấp", code: "KHOA_HO_HAP", type: "KHOA", children: [
    { name: "Phòng khám Hô hấp", code: "PK_HO_HAP_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Hô hấp", code: "KDT_HO_HAP", type: "KHU" },
    { name: "Khu theo dõi Hô hấp", code: "KTD_HO_HAP", type: "KHU" },
  ]},
  { name: "Khoa Cơ - Xương - Khớp", code: "KHOA_CXK", type: "KHOA", children: [
    { name: "Phòng khám Cơ - Xương - Khớp", code: "PK_CXK_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị CXK", code: "KDT_CXK", type: "KHU" },
    { name: "Khu phục hồi vận động", code: "KPH_VAN_DONG", type: "KHU" },
  ]},
  { name: "Khoa Thần kinh & Đơn vị Đột quỵ", code: "KHOA_THAN_KINH", type: "KHOA", children: [
    { name: "Phòng khám Thần kinh", code: "PK_THAN_KINH_K", type: "PHONG_KHAM" },
    { name: "Đơn vị Đột quỵ", code: "DV_DOT_QUY", type: "DON_VI", children: [
      { name: "Khu cấp cứu đột quỵ", code: "KHU_CC_DQ", type: "KHU" },
      { name: "Khu theo dõi đột quỵ", code: "KHU_TD_DQ", type: "KHU" },
      { name: "Khu phục hồi sau đột quỵ", code: "KHU_PH_SAU_DQ", type: "KHU" },
    ]},
    { name: "Khu điều trị Thần kinh", code: "KDT_THAN_KINH", type: "KHU" },
  ]},
  { name: "Khoa Bệnh Nhiệt đới & Truyền nhiễm", code: "KHOA_NHIET_DOI", type: "KHOA", children: [
    { name: "Phòng khám Nhiệt đới", code: "PK_NHIET_DOI_K", type: "PHONG_KHAM" },
    { name: "Khu bệnh truyền nhiễm", code: "KHU_TRUYEN_NHIEM", type: "KHU" },
    { name: "Khu cách ly", code: "KHU_CACH_LY", type: "KHU" },
    { name: "Khu theo dõi truyền nhiễm", code: "KTD_TRUYEN_NHIEM", type: "KHU" },
  ]},
  { name: "Khoa Y học cổ truyền & PHCN", code: "KHOA_YHCT_PHCN", type: "KHOA", children: [
    { name: "Phòng khám Y học cổ truyền", code: "PK_YHCT_K", type: "PHONG_KHAM" },
    { name: "Đơn vị Y học cổ truyền", code: "DV_YHCT", type: "DON_VI" },
    { name: "Đơn vị Phục hồi chức năng", code: "DV_PHCN", type: "DON_VI" },
    { name: "Khu vật lý trị liệu", code: "KHU_VLTL", type: "KHU" },
    { name: "Khu phục hồi chức năng", code: "KHU_PHCN", type: "KHU" },
    { name: "Khu điều trị YHCT", code: "KDT_YHCT", type: "KHU" },
  ]},
  { name: "Khoa Lão khoa & Chăm sóc giảm nhẹ", code: "KHOA_LAO_KHOA", type: "KHOA", children: [
    { name: "Phòng khám Lão khoa", code: "PK_LAO_KHOA_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Lão khoa", code: "KDT_LAO_KHOA", type: "KHU" },
    { name: "Đơn vị Chăm sóc giảm nhẹ", code: "DV_CSGN", type: "DON_VI" },
    { name: "Khu chăm sóc giảm nhẹ", code: "KHU_CSGN", type: "KHU" },
  ]},
  // ── D. NGOẠI KHOA ──
  { name: "Khoa Ngoại tổng hợp", code: "KHOA_NGOAI_TH", type: "KHOA", children: [
    { name: "Phòng khám Ngoại TH", code: "PK_NGOAI_TH_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Ngoại TH", code: "KDT_NGOAI_TH", type: "KHU" },
  ]},
  { name: "Khoa Ngoại Gan - Mật - Tụy", code: "KHOA_NGOAI_GMT", type: "KHOA", children: [
    { name: "Phòng khám Gan - Mật - Tụy", code: "PK_GMT_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Ngoại GMT", code: "KDT_NGOAI_GMT", type: "KHU" },
  ]},
  { name: "Khoa Ngoại Thần kinh", code: "KHOA_NGOAI_TK", type: "KHOA", children: [
    { name: "Phòng khám Ngoại Thần kinh", code: "PK_NGOAI_TK_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Ngoại TK", code: "KDT_NGOAI_TK", type: "KHU" },
  ]},
  { name: "Khoa Ngoại Lồng ngực - Mạch máu", code: "KHOA_NGOAI_LNMM", type: "KHOA", children: [
    { name: "Phòng khám Lồng ngực", code: "PK_LONG_NGUC_K", type: "PHONG_KHAM" },
    { name: "Phòng khám Mạch máu", code: "PK_MACH_MAU_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị LNMM", code: "KDT_NGOAI_LNMM", type: "KHU" },
  ]},
  { name: "Khoa Ngoại Tiết niệu", code: "KHOA_NGOAI_TN", type: "KHOA", children: [
    { name: "Phòng khám Ngoại Tiết niệu", code: "PK_NGOAI_TN_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Ngoại TN", code: "KDT_NGOAI_TN", type: "KHU" },
  ]},
  { name: "Khoa Chấn thương chỉnh hình", code: "KHOA_CTCH", type: "KHOA", children: [
    { name: "Phòng khám CTCH", code: "PK_CTCH_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị CTCH", code: "KDT_CTCH", type: "KHU" },
    { name: "Khu phục hồi sau phẫu thuật", code: "KPH_SAU_PT", type: "KHU" },
  ]},
  { name: "Khoa Bỏng & Tạo hình thẩm mỹ", code: "KHOA_BONG_TH", type: "KHOA", children: [
    { name: "Phòng khám Bỏng", code: "PK_BONG_K", type: "PHONG_KHAM" },
    { name: "Đơn vị Bỏng", code: "DV_BONG", type: "DON_VI" },
    { name: "Đơn vị Tạo hình", code: "DV_TAO_HINH", type: "DON_VI" },
    { name: "Khu điều trị Bỏng TH", code: "KDT_BONG_TH", type: "KHU" },
  ]},
  { name: "Khoa Phẫu thuật - Gây mê hồi sức", code: "KHOA_PT_GMHS", type: "KHOA", children: [
    { name: "Khu chuẩn bị phẫu thuật", code: "KHU_CB_PT", type: "KHU" },
    { name: "Khu phòng mổ", code: "KHU_PHONG_MO", type: "KHU" },
    { name: "Khu gây mê", code: "KHU_GAY_ME", type: "KHU" },
    { name: "Khu hồi tỉnh", code: "KHU_HOI_TINH", type: "KHU" },
  ]},
  // ── E. UNG BƯỚU – SẢN – NHI ──
  { name: "Khoa Ung bướu & Xạ trị", code: "KHOA_UNG_BUOU", type: "KHOA", children: [
    { name: "Phòng khám Ung bướu", code: "PK_UNG_BUOU_K", type: "PHONG_KHAM" },
    { name: "Đơn vị Ung bướu nội khoa", code: "DV_UB_NOI", type: "DON_VI" },
    { name: "Đơn vị Xạ trị", code: "DV_XA_TRI", type: "DON_VI" },
    { name: "Khu hóa trị", code: "KHU_HOA_TRI", type: "KHU" },
    { name: "Khu xạ trị", code: "KHU_XA_TRI", type: "KHU" },
    { name: "Khu điều trị Ung bướu", code: "KDT_UNG_BUOU", type: "KHU" },
  ]},
  { name: "Khoa Phụ sản", code: "KHOA_PHU_SAN", type: "KHOA", children: [
    { name: "Phòng khám Sản", code: "PK_SAN_K", type: "PHONG_KHAM" },
    { name: "Phòng khám Phụ khoa", code: "PK_PHU_KHOA_K", type: "PHONG_KHAM" },
    { name: "Khu sản", code: "KHU_SAN", type: "KHU" },
    { name: "Khu phụ khoa", code: "KHU_PHU_KHOA", type: "KHU" },
    { name: "Khu sinh", code: "KHU_SINH", type: "KHU" },
    { name: "Khu hậu sản", code: "KHU_HAU_SAN", type: "KHU" },
  ]},
  { name: "Khoa Nhi & Sơ sinh (NICU)", code: "KHOA_NHI", type: "KHOA", children: [
    { name: "Phòng khám Nhi", code: "PK_NHI_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Nhi", code: "KDT_NHI", type: "KHU" },
    { name: "Đơn vị Sơ sinh", code: "DV_SO_SINH", type: "DON_VI" },
    { name: "Đơn vị NICU", code: "DV_NICU", type: "DON_VI", children: [
      { name: "Khu chăm sóc sơ sinh tích cực", code: "KCS_SS_TC", type: "KHU" },
      { name: "Khu theo dõi sơ sinh", code: "KTD_SO_SINH", type: "KHU" },
      { name: "Khu chăm sóc đặc biệt", code: "KCS_DAC_BIET", type: "KHU" },
    ]},
    { name: "Khu chăm sóc sơ sinh", code: "KCS_SO_SINH", type: "KHU" },
  ]},
  // ── F. CHUYÊN KHOA ──
  { name: "Khoa Mắt", code: "KHOA_MAT", type: "KHOA", children: [
    { name: "Phòng khám Mắt", code: "PK_MAT_K", type: "PHONG_KHAM" },
    { name: "Phòng khám Khúc xạ", code: "PK_KHUC_XA", type: "PHONG_KHAM" },
    { name: "Khu điều trị Mắt", code: "KDT_MAT", type: "KHU" },
  ]},
  { name: "Khoa Tai - Mũi - Họng", code: "KHOA_TMH", type: "KHOA", children: [
    { name: "Phòng khám Tai", code: "PK_TAI_K", type: "PHONG_KHAM" },
    { name: "Phòng khám Mũi", code: "PK_MUI_K", type: "PHONG_KHAM" },
    { name: "Phòng khám Họng", code: "PK_HONG_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị TMH", code: "KDT_TMH", type: "KHU" },
  ]},
  { name: "Khoa Răng - Hàm - Mặt", code: "KHOA_RHM", type: "KHOA", children: [
    { name: "Phòng khám Răng", code: "PK_RANG_K", type: "PHONG_KHAM" },
    { name: "Phòng khám Hàm mặt", code: "PK_HAM_MAT_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị RHM", code: "KDT_RHM", type: "KHU" },
  ]},
  { name: "Khoa Da liễu", code: "KHOA_DA_LIEU", type: "KHOA", children: [
    { name: "Phòng khám Da liễu", code: "PK_DA_LIEU_K", type: "PHONG_KHAM" },
    { name: "Khu điều trị Da liễu", code: "KDT_DA_LIEU", type: "KHU" },
    { name: "Khu thủ thuật Da liễu", code: "KTT_DA_LIEU", type: "KHU" },
  ]},
  // ── G. CẬN LÂM SÀNG ──
  { name: "Khoa Y học hạt nhân", code: "KHOA_YHHN", type: "KHOA", children: [
    { name: "Khu chẩn đoán YHHN", code: "KCD_YHHN", type: "KHU" },
    { name: "Khu điều trị YHHN", code: "KDT_YHHN", type: "KHU" },
    { name: "Phòng kỹ thuật YHHN", code: "PKT_YHHN", type: "KHU" },
  ]},
  { name: "Khoa Xét nghiệm", code: "KHOA_XET_NGHIEM", type: "KHOA", children: [
    { name: "Phòng lấy mẫu", code: "PHONG_LAY_MAU", type: "KHU" },
    { name: "Bộ phận Huyết học", code: "BP_HUYET_HOC", type: "DON_VI" },
    { name: "Bộ phận Hóa sinh", code: "BP_HOA_SINH", type: "DON_VI" },
    { name: "Bộ phận Vi sinh", code: "BP_VI_SINH", type: "DON_VI" },
    { name: "Bộ phận Miễn dịch", code: "BP_MIEN_DICH", type: "DON_VI" },
  ]},
  { name: "Khoa Giải phẫu bệnh", code: "KHOA_GPB", type: "KHOA", children: [
    { name: "Tiếp nhận bệnh phẩm", code: "TNBP", type: "DON_VI" },
    { name: "Xử lý bệnh phẩm", code: "XLBP", type: "DON_VI" },
    { name: "Mô bệnh học", code: "MBH", type: "DON_VI" },
    { name: "Tế bào học", code: "TBH", type: "DON_VI" },
  ]},
  { name: "Khoa Chẩn đoán hình ảnh", code: "KHOA_CDHA", type: "KHOA", children: [
    { name: "X-quang", code: "X_QUANG", type: "DON_VI" },
    { name: "Siêu âm", code: "SIEU_AM", type: "DON_VI" },
    { name: "CT", code: "CT_SCAN", type: "DON_VI" },
    { name: "MRI", code: "MRI_SCAN", type: "DON_VI" },
    { name: "Can thiệp hình ảnh", code: "CAN_THIEP_HA", type: "DON_VI" },
  ]},
  { name: "Khoa Nội soi & Thăm dò chức năng", code: "KHOA_NOI_SOI", type: "KHOA", children: [
    { name: "Nội soi tiêu hóa", code: "NS_TIEU_HOA", type: "DON_VI" },
    { name: "Nội soi hô hấp", code: "NS_HO_HAP", type: "DON_VI" },
    { name: "Nội soi chuyên khoa", code: "NS_CHUYEN_KHOA", type: "DON_VI" },
    { name: "Điện tim", code: "DIEN_TIM", type: "DON_VI" },
    { name: "Điện não", code: "DIEN_NAO", type: "DON_VI" },
    { name: "Thăm dò chức năng", code: "TDCN", type: "DON_VI" },
  ]},
  { name: "Khoa Huyết học truyền máu", code: "KHOA_HHTM", type: "KHOA", children: [
    { name: "Ngân hàng máu", code: "NGAN_HANG_MAU", type: "DON_VI" },
    { name: "Tiếp nhận máu", code: "TIEP_NHAN_MAU", type: "DON_VI" },
    { name: "Xét nghiệm hòa hợp", code: "XN_HOA_HOP", type: "DON_VI" },
    { name: "Lưu trữ máu", code: "LUU_TRU_MAU", type: "DON_VI" },
    { name: "Phát máu", code: "PHAT_MAU", type: "DON_VI" },
  ]},
  // ── H. ĐIỀU TRỊ CHUYÊN SÂU ──
  { name: "Đơn nguyên Ghép tạng", code: "DN_GHEP_TANG", type: "KHOA", children: [
    { name: "Phòng khám Ghép tạng", code: "PK_GHEP_TANG", type: "PHONG_KHAM" },
    { name: "Khu đánh giá trước ghép", code: "KDG_TRUOC_GHEP", type: "KHU" },
    { name: "Khu điều trị Ghép tạng", code: "KDT_GHEP_TANG", type: "KHU" },
    { name: "Khu theo dõi sau ghép", code: "KTD_SAU_GHEP", type: "KHU" },
    { name: "Hội đồng Ghép tạng", code: "HD_GHEP_TANG", type: "DON_VI" },
  ]},
  // ── I. DƯỢC – DINH DƯỠNG ──
  { name: "Khoa Dược", code: "KHOA_DUOC", type: "KHOA", children: [
    { name: "Nhà thuốc bệnh viện", code: "NHA_THUOC_BV", type: "DON_VI" },
    { name: "Kho thuốc", code: "KHO_THUOC", type: "DON_VI" },
    { name: "Kho thuốc kiểm soát đặc biệt", code: "KHO_THUOC_KSDB", type: "DON_VI" },
    { name: "Dược lâm sàng", code: "DUOC_LAM_SANG", type: "DON_VI" },
  ]},
  { name: "Khoa Dinh dưỡng - Tiết chế", code: "KHOA_DINH_DUONG", type: "KHOA", children: [
    { name: "Phòng khám Dinh dưỡng", code: "PK_DINH_DUONG", type: "PHONG_KHAM" },
    { name: "Tư vấn dinh dưỡng", code: "TV_DINH_DUONG", type: "DON_VI" },
    { name: "Bếp ăn bệnh viện", code: "BEP_AN_BV", type: "DON_VI" },
    { name: "Bộ phận Tiết chế", code: "BP_TIET_CHE", type: "DON_VI" },
  ]},
  // ── J. KSNK ──
  { name: "Khoa Kiểm soát nhiễm khuẩn", code: "KHOA_KSNK", type: "KHOA", children: [
    { name: "Giám sát nhiễm khuẩn", code: "GS_NK", type: "DON_VI" },
    { name: "Khử khuẩn", code: "KHU_KHUAN_DV", type: "DON_VI" },
    { name: "Tiệt khuẩn", code: "TIET_KHUAN", type: "DON_VI" },
    { name: "Phòng chống nhiễm khuẩn", code: "PC_NK", type: "DON_VI" },
  ]},
  // ══ PHÒNG BAN HÀNH CHÍNH ══
  { name: "Phòng Vật tư - Thiết bị y tế", code: "PHONG_VT_TBYT", type: "PHONG", children: [
    { name: "Kho vật tư", code: "KHO_VAT_TU", type: "DON_VI" },
    { name: "Quản lý vật tư", code: "QL_VAT_TU", type: "DON_VI" },
    { name: "Quản lý thiết bị y tế", code: "QL_TBYT", type: "DON_VI" },
    { name: "Bảo trì thiết bị", code: "BAO_TRI_TB", type: "DON_VI" },
  ]},
  { name: "Phòng Điều dưỡng", code: "PHONG_DIEU_DUONG", type: "PHONG", children: [
    { name: "Quản lý điều dưỡng", code: "QL_DD", type: "DON_VI" },
    { name: "Phân công điều dưỡng", code: "PC_DD", type: "DON_VI" },
    { name: "Chăm sóc người bệnh", code: "CS_NB", type: "DON_VI" },
    { name: "Đào tạo điều dưỡng", code: "DT_DD", type: "DON_VI" },
  ]},
  { name: "Phòng Kế hoạch Tổng hợp", code: "PHONG_KHTH", type: "PHONG", children: [
    { name: "Kế hoạch", code: "KE_HOACH", type: "DON_VI" },
    { name: "Thống kê", code: "THONG_KE", type: "DON_VI" },
    { name: "Báo cáo", code: "BAO_CAO", type: "DON_VI" },
    { name: "Điều phối chuyên môn", code: "DPCM", type: "DON_VI" },
  ]},
  { name: "Phòng Tài chính - Kế toán", code: "PHONG_TCKT", type: "PHONG", children: [
    { name: "Thu viện phí", code: "THU_VIEN_PHI", type: "DON_VI" },
    { name: "Thanh toán", code: "THANH_TOAN_DV", type: "DON_VI" },
    { name: "Công nợ", code: "CONG_NO", type: "DON_VI" },
    { name: "Kế toán", code: "KE_TOAN", type: "DON_VI" },
  ]},
  { name: "Phòng Tổ chức Cán bộ", code: "PHONG_TCCB", type: "PHONG", children: [
    { name: "Hồ sơ nhân sự", code: "HS_NHAN_SU", type: "DON_VI" },
    { name: "Hợp đồng", code: "HOP_DONG", type: "DON_VI" },
    { name: "Chấm công", code: "CHAM_CONG", type: "DON_VI" },
    { name: "Quản lý chức danh", code: "QL_CHUC_DANH", type: "DON_VI" },
  ]},
  { name: "Phòng Công nghệ thông tin", code: "PHONG_CNTT", type: "PHONG", children: [
    { name: "HIS", code: "HT_HIS", type: "DON_VI" },
    { name: "LIS", code: "HT_LIS", type: "DON_VI" },
    { name: "RIS/PACS", code: "HT_PACS", type: "DON_VI" },
    { name: "Cổng người bệnh", code: "CONG_NB", type: "DON_VI" },
    { name: "Hạ tầng mạng", code: "HA_TANG_MANG", type: "DON_VI" },
    { name: "Hỗ trợ người dùng", code: "HT_NGUOI_DUNG", type: "DON_VI" },
  ]},
  { name: "Phòng Quản lý chất lượng & CSKH", code: "PHONG_QLCL_CSKH", type: "PHONG", children: [
    { name: "Quản lý chất lượng", code: "QL_CHAT_LUONG", type: "DON_VI" },
    { name: "An toàn người bệnh", code: "AT_NB", type: "DON_VI" },
    { name: "Quản lý sự cố", code: "QL_SU_CO", type: "DON_VI" },
    { name: "Cải tiến chất lượng", code: "CTCL", type: "DON_VI" },
    { name: "Tiếp nhận phản hồi", code: "TN_PHAN_HOI", type: "DON_VI" },
    { name: "Giải đáp người bệnh", code: "GD_NB", type: "DON_VI" },
    { name: "Khảo sát hài lòng", code: "KS_HAI_LONG", type: "DON_VI" },
    { name: "Chăm sóc sau khám", code: "CS_SAU_KHAM", type: "DON_VI" },
  ]},
  { name: "Trung tâm Đào tạo & Chỉ đạo tuyến", code: "TT_DT_CDT", type: "TRUNG_TAM", children: [
    { name: "Đào tạo", code: "DAO_TAO", type: "DON_VI" },
    { name: "Đào tạo liên tục", code: "DT_LIEN_TUC", type: "DON_VI" },
    { name: "Chỉ đạo tuyến", code: "CHI_DAO_TUYEN", type: "DON_VI" },
    { name: "Hội thảo", code: "HOI_THAO", type: "DON_VI" },
    { name: "Quản lý học viên", code: "QL_HOC_VIEN", type: "DON_VI" },
  ]},
];

async function seedLevel(items: DeptNode[], parentId: string | null = null) {
  for (const item of items) {
    const created = await (prisma as any).department.upsert({
      where: { code: item.code },
      update: { name: item.name, type: item.type, parentId },
      create: { code: item.code, name: item.name, type: item.type, parentId },
    });
    if (item.children && item.children.length > 0) {
      await seedLevel(item.children, created.id);
    }
  }
}

async function main() {
  console.log('Xóa toàn bộ departments cũ...');
  await (prisma as any).appointment.deleteMany({});
  await (prisma as any).doctor.deleteMany({});
  await (prisma as any).department.deleteMany({});

  console.log('Seed cấu trúc đúng chuẩn...');
  await seedLevel(structure);

  const counts = await Promise.all([
    (prisma as any).department.count({ where: { type: 'KHOA' } }),
    (prisma as any).department.count({ where: { type: 'PHONG' } }),
    (prisma as any).department.count({ where: { type: 'TRUNG_TAM' } }),
    (prisma as any).department.count({ where: { type: 'PHONG_KHAM' } }),
    (prisma as any).department.count({ where: { type: 'DON_VI' } }),
    (prisma as any).department.count({ where: { type: 'KHU' } }),
    (prisma as any).department.count(),
  ]);

  console.log('\n=== KẾT QUẢ ===');
  console.log(`KHOA (lâm sàng):      ${counts[0]}`);
  console.log(`PHÒNG (hành chính):   ${counts[1]}`);
  console.log(`TRUNG TÂM:            ${counts[2]}`);
  console.log(`PHÒNG KHÁM:           ${counts[3]}`);
  console.log(`ĐƠN VỊ:               ${counts[4]}`);
  console.log(`KHU:                  ${counts[5]}`);
  console.log(`TỔNG:                 ${counts[6]}`);
  console.log('\nHoàn tất!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => (prisma as any).$disconnect());
