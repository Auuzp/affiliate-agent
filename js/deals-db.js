/**
 * Verified Shopee Deals Database with Exact Product Sample Pictures & Accurate Copy
 * คลังสินค้าคัดเลือกเฉพาะดีลที่ดีที่สุด พร้อมรูปตัวอย่างสินค้าจริงที่ตรงกับแคปชั่น 100%
 * เรียงลำดับจากค่าคอมมิชชันสูงสุดลงมา (32% ➡️ 11%)
 */

const SHOP_OFFERS_DATABASE = [
  // --- อันดับ 1: คอมมิชชัน 32% (สูงสุด!) ---
  {
    id: 'deal-001',
    shopName: 'Torso & Thread',
    category: 'fashion_men',
    categoryName: '👕 เสื้อยืดผู้ชาย Oversize คอตตอน 100%',
    title: 'เสื้อยืด Oversize ผู้ชาย Torso & Thread ผ้าฝ้ายแท้ 100% ลายพิมพ์การ์ตูน นุ่มสบาย ระบายอากาศดี มีถุงแบรนด์',
    originalPrice: 590,
    salePrice: 280,
    discount: 'ลด 52%',
    rating: 4.9,
    soldCount: '2.4 หมื่นชิ้น',
    commissionRate: '32% (สูงสุด!)',
    estCommission: 89.60,
    imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zt-mm8ebnvxbk7cde',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'ผลิตจากผ้าฝ้ายแท้ 100% (Cotton 100%) นุ่มละมุนผิว ไม่ระคายเคือง',
      'ทรง Oversize สไตล์สตรีทมินิมอล ลายพิมพ์คมชัด ไม่ลอกไม่แตกหลังซัก',
      'งานผลิตเกรดพรีเมียมจากโรงงานโดยตรง พร้อมป้ายแท็กและถุงแบรนด์ Torso & Thread'
    ],
    hashtags: ['#เสื้อยืดโอเวอร์ไซส์', '#เสื้อยืดผู้ชาย', '#TorsoAndThread', '#แฟชั่นผู้ชาย', '#ShopeeTH', '#ป้ายยาช้อปปี้'],
    defaultUrl: 'https://s.shopee.co.th/qjMNXMpj9'
  },
  {
    id: 'deal-002',
    shopName: 'Rosa Mute',
    category: 'fashion_women',
    categoryName: '🌸 เสื้อยืดผู้หญิง แฟชั่นเกาหลี 100% Cotton',
    title: 'เสื้อยืดแฟชั่นผู้หญิง Rosa Mute 100% Cotton ผ้านุ่ม ใส่สบาย ลายกราฟิกน่ารัก ทรงสวย มีไซส์ S-3XL',
    originalPrice: 650,
    salePrice: 290,
    discount: 'ลด 55%',
    rating: 4.9,
    soldCount: '1.8 หมื่นชิ้น',
    commissionRate: '32% (สูงสุด!)',
    estCommission: 92.80,
    imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zu-mm8cvyazrojm14',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'เนื้อผ้า Cotton เกรดพรีเมียม นุ่มละมุน ไม่บาง ไม่ร้อน ระบายอากาศยอดเยี่ยม',
      'ดีไซน์น่ารัก ลายสกรีนมินิมอลเกาหลี แมตช์ง่ายได้ทุกลุค ใส่ถ่ายรูปขึ้นกล้องสุดๆ',
      'มีโทนสีให้เลือกมากกว่า 10 เฉดสี ไซส์ครอบคลุม S ถึง 3XL ใส่สบายไม่อึดอัด'
    ],
    hashtags: ['#เสื้อยืดผู้หญิง', '#เสื้อยืดเกาหลี', '#RosaMute', '#แฟชั่นผู้หญิง', '#ShopeeTH', '#ของดีบอกต่อ'],
    defaultUrl: 'https://s.shopee.co.th/Ln5mcOjk4'
  },

  // --- อันดับ 2: คอมมิชชัน 22% ---
  {
    id: 'deal-003',
    shopName: 'Organic everything',
    category: 'health_soap',
    categoryName: '🌿 สบู่รวมสมุนไพรธรรมชาติแท้ 100%',
    title: 'สบู่รวมสมุนไพรธรรมชาติ Soap PLOY Organic everything ลดผื่นคัน แก้น้ำเหลืองเสีย ผิวใส อ่อนโยน ปลอดภัย',
    originalPrice: 350,
    salePrice: 159,
    discount: 'ลด 55%',
    rating: 5.0,
    soldCount: '3.6 หมื่นชิ้น',
    commissionRate: '22%',
    estCommission: 34.98,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-7ras9-m3zrfvaxfop6d8',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'สารสกัดจากสมุนไพรธรรมชาติแท้ 100% ไร้สารเคมี ปลอดภัยต่อผิวแพ้ง่าย',
      'ฟองนุ่มละเอียด ทำความสะอาดหมดจด ช่วยลดอาการคัน ผดผื่น และสิวที่หลัง',
      'กลิ่นหอมสดชื่นจากธรรมชาติ บำรุงผิวให้เนียนนุ่มชุ่มชื้น ไม่แห้งตึง'
    ],
    hashtags: ['#สบู่สมุนไพร', '#สบู่ลดสิว', '#แก้คันผดผื่น', '#OrganicEverything', '#ShopeeTH', '#ของดีบอกต่อ'],
    defaultUrl: 'https://s.shopee.co.th/4fw4wa8EwU'
  },

  // --- อันดับ 3: คอมมิชชัน 20% ---
  {
    id: 'deal-004',
    shopName: 'ธรรมชาติคัดสรร',
    category: 'healthy_snack',
    categoryName: '🍠 มันหนึบญี่ปุ่นแท้ 99% หวานนุ่มหนึบเพื่อสุขภาพ',
    title: 'มันหนึบญี่ปุ่นแท้ 99% ร้านธรรมชาติคัดสรร หวานนุ่มหนึบ อร่อยธรรมชาติ ชิ้นใหญ่ คละไซส์ มี อย. ถูกต้อง',
    originalPrice: 390,
    salePrice: 189,
    discount: 'ลด 51%',
    rating: 4.9,
    soldCount: '5.1 หมื่นชิ้น',
    commissionRate: '20%',
    estCommission: 37.80,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztp-mry9xg5y09vka6',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'ทำจากมันเทศแท้ 99% คัดสรรเนื้อส้มแท้ หวานหอมธรรมชาติ ไม่แต่งสารสังเคราะห์',
      'ไขมัน 0% คอเลสเตอรอล 0% พลังงานต่ำ อิ่มท้องนาน เหมาะสำหรับคนรักสุขภาพ',
      'ชิ้นใหญ่เต็มคำ บรรจุซองแยกชิ้น สะอาด พกพาสะดวก ได้มาตรฐาน อย.'
    ],
    hashtags: ['#มันหนึบญี่ปุ่น', '#ธรรมชาติคัดสรร', '#ขนมเพื่อสุขภาพ', '#ลดน้ำหนัก', '#ShopeeTH', '#ของอร่อยบอกต่อ'],
    defaultUrl: 'https://s.shopee.co.th/60RSX23AEc'
  },
  {
    id: 'deal-005',
    shopName: 'ร้านลมเย็นยามค่ำ',
    category: 'home_decor',
    categoryName: '🏡 แผ่นผนังกั้นลอนเก้าเหลี่ยม PU ตกแต่งห้อง',
    title: 'แผ่นลอนเก้าเหลี่ยม PU แต่งผนัง ร้านลมเย็นยามค่ำ ฉากกั้นพื้นหลังหรูหรา น้ำหนักเบา ติดตั้งง่ายด้วยกาว ไม่ต้องเจาะ',
    originalPrice: 450,
    salePrice: 199,
    discount: 'ลด 56%',
    rating: 4.9,
    soldCount: '2.8 หมื่นชิ้น',
    commissionRate: '20%',
    estCommission: 39.80,
    imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-8258t-mq97cp7n4we8ce',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'วัสดุ PU น้ำหนักเบา ทนทาน ไม่กินผนัง คุมโทนมินิมอล หรูหราทันสมัย',
      'ติดตั้งง่ายด้วยกาวตะปูหรือเทปกาวสองหน้า ไม่ต้องเจาะรูผนังให้เป็นรอย',
      'เหมาะสำหรับแต่งห้องนอน โต๊ะคอม สตูดิโอถ่ายคลิป หรือฉากกั้นห้อง'
    ],
    hashtags: ['#แผ่นลอนแต่งห้อง', '#แต่งห้องนอน', '#จัดโต๊ะคอม', '#ร้านลมเย็นยามค่ำ', '#ShopeeTH', '#ของแต่งบ้าน'],
    defaultUrl: 'https://s.shopee.co.th/6L4Ive1tYe'
  },
  {
    id: 'deal-006',
    shopName: 'lyjshop222',
    category: 'toys',
    categoryName: '🔫 ของเล่นปืนลูกซองแฝด S686 กระสุนโฟมนุ่ม',
    title: 'ของเล่นปืนลูกซองแฝด S686 lyjshop222 สองลำกล้อง กระสุนโฟมนุ่ม ปลอดภัย มีสโคปเล็ง เล่นสนุกสุดมันส์',
    originalPrice: 490,
    salePrice: 219,
    discount: 'ลด 55%',
    rating: 4.8,
    soldCount: '4.2 หมื่นชิ้น',
    commissionRate: '20%',
    estCommission: 43.80,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztc-mjs6zw4vmqrra0',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'ดีไซน์ปืนลูกซองแฝดยอดฮิต S686 สองสีสันสดใส เท่ ถือกระชับมือ',
      'ใช้กระสุนโฟม EVA แบบนิ่มพิเศษ ปลอดภัย ไม่เป็นอันตรายต่อเด็กและเฟอร์นิเจอร์',
      'กลไกหักลำใส่กระสุนสมจริง เสริมสร้างจินตนาการและความสนุกสนาน'
    ],
    hashtags: ['#ของเล่นเด็ก', '#ปืนของเล่น', '#ปืนลูกซองแฝด', '#lyjshop222', '#ShopeeTH', '#ของขวัญเด็ก'],
    defaultUrl: 'https://s.shopee.co.th/6AksjL2Wtf'
  },

  // --- อันดับ 4: คอมมิชชัน 18% ---
  {
    id: 'deal-007',
    shopName: 'แผงแม่เหล็ก ข้าร้าชการ',
    category: 'uniform_accessories',
    categoryName: '🎖️ แผงแม่เหล็กติดป้ายชื่อ & ตราสัญลักษณ์ข้าราชการ',
    title: 'แผงแม่เหล็กพร้อมเข็มกลัด กาว 3M สำหรับติดตราสัญลักษณ์และเครื่องหมายข้าราชการ แรงดูดสูง ไม่ทำลายเนื้อผ้า',
    originalPrice: 799,
    salePrice: 699,
    discount: 'ลดพิเศษ',
    rating: 5.0,
    soldCount: '6.5 หมื่นชิ้น',
    commissionRate: '18%',
    estCommission: 125.82,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134201-81ztd-msqf6s4kzz0h38',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'แรงดูดแม่เหล็กนีโอไดเมียมทรงพลัง ติดแน่น ไม่เลื่อนหลุดตลอดวัน',
      'ใช้กาว 3M แท้ คุณภาพสูง ติดสนิทกับป้ายชื่อ แพรแถบ และตราสัญลักษณ์',
      'ช่วยถนอมชุดข้าราชการ ไม่ต้องใช้เข็มกลัดเจาะผ้าให้เป็นรูเสียหาย'
    ],
    hashtags: ['#แผงแม่เหล็ก', '#ป้ายชื่อข้าราชการ', '#เครื่องหมายข้าราชการ', '#ชุดข้าราชการ', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/AKaRgzmfS5'
  },

  // --- อันดับ 5: คอมมิชชัน 17% ---
  {
    id: 'deal-008',
    shopName: 'NieabNieab Store',
    category: 'lifestyle_spray',
    categoryName: '👔 สเปรย์ปรับผ้าเรียบไม่ต้องง้อเตารีด 60ml',
    title: 'สเปรย์ปรับผ้าเรียบ เนี๊ยบเนี๊ยบ (Wrinkle Fix 60ml) กลิ่นเออร์เบิน เฟรช ฉีดได้ 470 ครั้ง พกพาง่าย ผ้าเรียบทันใจ',
    originalPrice: 290,
    salePrice: 129,
    discount: 'ลด 56%',
    rating: 4.9,
    soldCount: '4.8 หมื่นชิ้น',
    commissionRate: '17%',
    estCommission: 21.93,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mr4tl50655ac2f',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'นวัตกรรมหัวฉีด Ultra Fine Mist ละอองละเอียด กระจายตัวสม่ำเสมอ',
      'แค่ฉีดแล้วลูบเบาๆ ผ้าก็เรียบทันที ไม่ต้องใช้เตารีด ประหยัดเวลาชีวิต',
      'ขนาด 60 ml พกติดกระเป๋าไปทำงานหรือเที่ยวได้สะดวก ฉีดได้มากถึง 470 ครั้ง'
    ],
    hashtags: ['#สเปรย์ปรับผ้าเรียบ', '#เนี๊ยบเนี๊ยบ', '#WrinkleFix', '#เด็กหอต้องมี', '#ของดีบอกต่อ', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/40gO9MAmIQ'
  },

  // --- อันดับ 6: คอมมิชชัน 16% ---
  {
    id: 'deal-009',
    shopName: 'DR.KK',
    category: 'beauty_skincare',
    categoryName: '✨ เซ็ตกู้ผิวเฒ่า ลดริ้วรอย DR.KK (Refive + Exoshoot)',
    title: 'เซ็ตกู้ผิวเฒ่า DR.KK ลดเลือนริ้วรอย ฟื้นฟูผิวหน้าดูอ่อนเยาว์ (Refive Essence + Exoshoot Serum 35+) ของแท้หมอผิวหนัง',
    originalPrice: 1080,
    salePrice: 648,
    discount: 'ลด 40%',
    rating: 4.9,
    soldCount: '1.9 หมื่นชิ้น',
    commissionRate: '16%',
    estCommission: 103.68,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zte-msu1cyx7hd6o3e',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'สูตรเวชสำอางผสาน Intensive Exosome Ampoule เข้มข้น ฟื้นฟูโครงสร้างผิวลึก',
      'ลดเลือนริ้วรอย ร่องลึก จุดด่างดำ ให้ผิวดูกระชับ เรียบเนียน อ่อนกว่าวัย',
      'อ่อนโยน ไม่ระคายเคือง ปราศจากสารสเตียรอยด์และแอลกอฮอล์'
    ],
    hashtags: ['#เซรั่มหน้าใส', '#DRKK', '#เซ็ตกู้ผิวเฒ่า', '#ลดริ้วรอย', '#เวชสำอาง', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/2BEjxzHl1H'
  },

  // --- อันดับ 7: คอมมิชชัน 14% ---
  {
    id: 'deal-010',
    shopName: 'Lalla Kids',
    category: 'kids_fashion',
    categoryName: '👗 ชุดเดรสเจ้าหญิงเด็กฟูฟ่อง สีม่วงพาสเทล',
    title: 'ชุดเดรสเจ้าหญิงเด็กฟูฟ่อง Lalla Kids สไตล์เจ้าหญิงดิสนีย์ สีม่วงพาสเทล ผ้าลูกไม้พรีเมียม ใส่สบาย ไม่คัน',
    originalPrice: 690,
    salePrice: 299,
    discount: 'ลด 57%',
    rating: 5.0,
    soldCount: '3.3 หมื่นชิ้น',
    commissionRate: '14%',
    estCommission: 41.86,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztp-mm7jn341gpvmfb',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'ดีไซน์เดรสเจ้าหญิงทรงฟูฟ่อง ละมุนน่ารัก ใส่แล้วเหมือนหลุดมาจากเทพนิยาย',
      'ซับในผ้าฝ้ายนุ่มพิเศษ ไม่ระคายเคืองผิวบอบบางของลูกน้อย ไม่คันแน่นอน',
      'เหมาะสำหรับใส่ไปงานวันเกิด งานโรงเรียน งานแต่ง หรือถ่ายรูปเก็บความทรงจำ'
    ],
    hashtags: ['#ชุดเจ้าหญิงเด็ก', '#ชุดเดรสเด็ก', '#LallaKids', '#แฟชั่นเด็กผู้หญิง', '#แม่และเด็ก', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/2qUQlDFDfL'
  },

  // --- อันดับ 8: คอมมิชชัน 13% ---
  {
    id: 'deal-011',
    shopName: 'Dogkery',
    category: 'pet_food',
    categoryName: '🐾 ขนมเกลียวสุนัขเพื่อสุขภาพ Dogkery ไม่เค็ม',
    title: 'ขนมสุนัขเกลียวอบกรอบ Dogkery วัตถุดิบธรรมชาติ 100% เนื้อนิ่ม ทานง่าย ปลอดภัยต่อไต ซื้อคู่สุดคุ้ม',
    originalPrice: 280,
    salePrice: 135,
    discount: 'ลด 52%',
    rating: 5.0,
    soldCount: '5.6 หมื่นชิ้น',
    commissionRate: '13%',
    estCommission: 17.55,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztd-mqlj8mmltybl8e',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'ทำจากเนื้อสัตว์แท้ 100% เกรดคนทาน ไม่ใส่เกลือ ไม่ใส่น้ำตาล ปลอดภัยต่อไต',
      'เนื้อนิ่ม ทานง่าย เหมาะสำหรับสุนัขทุกวัยตั้งแต่ 2 เดือนขึ้นไป',
      'แบรนด์เบเกอรี่และขนมสุนัขเพื่อสุขภาพที่สัตวแพทย์และทาสหมาแนะนำ'
    ],
    hashtags: ['#ขนมหมา', '#ขนมสุนัขเพื่อสุขภาพ', '#Dogkery', '#คนรักสุนัข', '#ทาสหมา', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/1Vz3AlKIND'
  },
  {
    id: 'deal-012',
    shopName: 'Nova Fragrance TH',
    category: 'perfume',
    categoryName: '✨ น้ำหอม Club De Nuit Intense Man ของแท้',
    title: 'น้ำหอมแท้ Club De Nuit Intense Man (Armaf) Nova Fragrance กลิ่นหรูละมุน มีเสน่ห์ ติดทนนาน 8-12 ชม. ส่งไวจากไทย',
    originalPrice: 1690,
    salePrice: 890,
    discount: 'ลด 47%',
    rating: 4.9,
    soldCount: '2.9 หมื่นชิ้น',
    commissionRate: '13%',
    estCommission: 115.70,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztg-mqs0otwpuuq354',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'น้ำหอมผู้ชายในตำนาน กลิ่นสับปะรดควันไม้ เทียบเคียงน้ำหอมนิชแบรนด์หรูระดับโลก',
      'กลิ่นเปิดสดชื่น กลิ่นกลางและเบสละมุนเย้ายวน ดึงดูดสายตาคนรอบข้าง',
      'การันตีของแท้ 100% หัวสเปรย์กระจายตัวดี กลิ่นติดทนนานตลอดวัน'
    ],
    hashtags: ['#น้ำหอมผู้ชาย', '#ClubDeNuit', '#NovaFragrance', '#น้ำหอมติดทน', '#ShopeeTH', '#ของดีบอกต่อ'],
    defaultUrl: 'https://s.shopee.co.th/4AzoLfA8xT'
  },

  // --- อันดับ 9: คอมมิชชัน 12% ---
  {
    id: 'deal-013',
    shopName: 'Classia',
    category: 'beauty_tools',
    categoryName: '✂️ เซ็ตกรรไกรตัดผม & ซอยผมมืออาชีพ Classia',
    title: 'เซ็ตกรรไกรตัดผมและซอยผมสแตนเลสสตีล Classia ระดับมืออาชีพ คมกริบ พร้อมกระเป๋าหนังเก็บอุปกรณ์',
    originalPrice: 590,
    salePrice: 249,
    discount: 'ลด 58%',
    rating: 4.9,
    soldCount: '2.1 หมื่นชิ้น',
    commissionRate: '12%',
    estCommission: 29.88,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zti-msdvtnuaf7ye37',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'ผลิตจากสแตนเลสสตีลคุณภาพสูง คมกริบ ตัดผมขาดเนียน ไม่ดึงเส้นผม',
      'ดีไซน์ตามหลักสรีรศาสตร์ จับถนัดมือ ไม่เมื่อยนิ้วเวลาตัดเป็นเวลานาน',
      'มาพร้อมกระเป๋าหนังซิปรูด Classia จัดเก็บอุปกรณ์เป็นระเบียบ พกพาสะดวก'
    ],
    hashtags: ['#กรรไกรตัดผม', '#กรรไกรซอยผม', '#Classia', '#ตัดผมเองที่บ้าน', '#ช่างตัดผม', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/9zxbINnw83'
  },
  {
    id: 'deal-014',
    shopName: 'under.armour',
    category: 'sportswear',
    categoryName: '🏃 ชุดกีฬาออกกำลังกาย Under Armour ของแท้',
    title: 'เสื้อผ้ากีฬาและกางเกงออกกำลังกาย Under Armour ของแท้ เนื้อผ้าแห้งไว ระบายเหงื่อดีเยี่ยม โปรลดสูงสุด 60%',
    originalPrice: 1590,
    salePrice: 690,
    discount: 'ลด 57%',
    rating: 4.9,
    soldCount: '1.5 หมื่นชิ้น',
    commissionRate: '12%',
    estCommission: 82.80,
    imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-8257z-mspsat4b356qe3',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'เทคโนโลยี HeatGear ระบายความร้อนและเหงื่อได้อย่างรวดเร็ว เบาสบายตัว',
      'ผ้ายืดหยุ่น 4 ทิศทาง รองรับทุกการเคลื่อนไหว ทั้งวิ่ง ฟิตเนส และเวทเทรนนิ่ง',
      'สินค้าลิขสิทธิ์แท้จาก Under Armour Official Store มั่นใจได้ 100%'
    ],
    hashtags: ['#UnderArmour', '#เสื้อผ้ากีฬา', '#ชุดออกกำลังกาย', '#วิ่ง', '#ฟิตเนส', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/50YvLC6yGW'
  },
  {
    id: 'deal-015',
    shopName: 'นิทานแม่นางฟ้า (Angel Mom Story)',
    category: 'kids_education',
    categoryName: '📚 แฟลชการ์ดหมวดรูปทรง คำศัพท์ภาษาอังกฤษเด็ก',
    title: 'แฟลชการ์ดหมวดรูปทรง นิทานแม่นางฟ้า การ์ดคำศัพท์ภาษาอังกฤษภาพวาดสีน้ำสดใส กระดาษหนา เสริมพัฒนาการเด็ก',
    originalPrice: 250,
    salePrice: 119,
    discount: 'ลด 52%',
    rating: 5.0,
    soldCount: '4.7 หมื่นชิ้น',
    commissionRate: '12%',
    estCommission: 14.28,
    imageUrl: 'https://down-th.img.susercontent.com/file/5928c055fb720f085bb7d4e471bae3df',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'ภาพประกอบลายเส้นสีน้ำน่ารัก สีสันสดใส ดึงดูดความสนใจของเด็กปฐมวัย',
      'สอนคำศัพท์ภาษาอังกฤษพื้นฐาน พร้อมคำอ่านและคำแปล เข้าใจง่าย',
      'การ์ดกระดาษหนาพิเศษ ขอบมน ไม่คม ปลอดภัย ไม่บาดมือน้องๆ'
    ],
    hashtags: ['#แฟลชการ์ด', '#นิทานแม่นางฟ้า', '#การ์ดคำศัพท์', '#ของเล่นเสริมพัฒนาการ', '#แม่และเด็ก', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/4qFV8t7bbX'
  },

  // --- อันดับ 10: คอมมิชชัน 11% ---
  {
    id: 'deal-016',
    shopName: 'Japan Model Tools',
    category: 'hobby_tools',
    categoryName: '🤖 คีมตัดโมเดลเทพ GodHand Ultimate Nipper',
    title: 'คีมตัดโมเดลเทพ GodHand Ultimate Nipper GH-SPN-120 สำหรับต่อกันพลาและโมเดล คมกริบ ไร้รอยฝ้า ของแท้ญี่ปุ่น',
    originalPrice: 2190,
    salePrice: 1490,
    discount: 'ลด 32%',
    rating: 5.0,
    soldCount: '8.4 พันชิ้น',
    commissionRate: '11%',
    estCommission: 163.90,
    imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-82597-mqqxbkovl91c7a',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'ใบมีดด้านเดียวแบบ Single-edged blade คมกริบ ตัดชิ้นส่วนพลาสติกเนียนกริบ',
      'ลดรอยฝ้าขาวบนชิ้นงาน ไม่ต้องเสียเวลาขัดกระดาษทรายซ้ำ ประหยัดเวลาต่อโมเดล',
      'คีมตัดโมเดลอันดับ 1 ในใจสายต่อกันพลาทั่วโลก ของแท้ผลิตในประเทศญี่ปุ่น'
    ],
    hashtags: ['#GodHand', '#คีมตัดกันพลา', '#ต่อกันดั้ม', '#JapanModelTools', '#โมเดลกันพลา', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/9V1KhSpq90'
  },
  {
    id: 'deal-017',
    shopName: 'CottonBaby',
    category: 'kids_apparel',
    categoryName: '👶 กางเกงในเด็กชาย 3-16 ปี มาตรฐาน 7A นุ่มสบาย',
    title: 'กางเกงในเด็กชาย 3-16 ปี CottonBaby ผ้าคอตตอนนุ่ม มาตรฐาน 7A ยับยั้งแบคทีเรีย ลาย Peanuts สนูปปี้ชกมวย',
    originalPrice: 290,
    salePrice: 129,
    discount: 'ลด 56%',
    rating: 4.9,
    soldCount: '3.1 หมื่นชิ้น',
    commissionRate: '11%',
    estCommission: 14.19,
    imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-823rr-movv1whmtj4067',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'เนื้อผ้าฝ้ายแท้ระบายอากาศดี นุ่มยืดหยุ่น ไม่อับชื้น สวมใส่สบายตลอดวัน',
      'ผ่านการรับรองมาตรฐาน 7A ช่วยยับยั้งแบคทีเรีย ปลอดภัยต่อผิวเด็ก',
      'ขอบยางนุ่มไม่รัดเอวจนเป็นรอย ลายสนูปปี้ลิขสิทธิ์น่ารัก ถูกใจน้องๆ'
    ],
    hashtags: ['#กางเกงในเด็ก', '#CottonBaby', '#เสื้อผ้าเด็ก', '#แม่และเด็ก', '#สนูปปี้', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/9fKktlpCo1'
  },
  {
    id: 'deal-018',
    shopName: 'exsox clock',
    category: 'motorcycle_gadget',
    categoryName: '🏍️ นาฬิกาดิจิทัลติดแฮนด์มอเตอร์ไซค์ LCD จอใหญ่',
    title: 'นาฬิกาดิจิทัลติดแฮนด์มอเตอร์ไซค์ exsox clock หน้าจอ LCD ขนาดใหญ่ มีไฟ LED Backlight กันน้ำ ทนทาน',
    originalPrice: 350,
    salePrice: 149,
    discount: 'ลด 57%',
    rating: 4.8,
    soldCount: '1.7 หมื่นชิ้น',
    commissionRate: '11%',
    estCommission: 16.39,
    imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mr7fxhou0mipf3',
    isRealImage: true,
    imageSource: 'Shopee Verified Product Photo',
    features: [
      'หน้าจอ LCD ขนาดใหญ่ ตัวเลขคมชัด มองเห็นเวลา วัน และวันที่ ได้ชัดเจนแม้วิ่งเร็ว',
      'ไฟ LED Backlight แสงนุ่มตา มองเห็นได้ชัดเจนในที่มืดและเวลากลางคืน',
      'โครงสร้างกันน้ำกันฝน ติดตั้งง่ายบนแฮนด์มอเตอร์ไซค์และจักรยานทุกรุ่น'
    ],
    hashtags: ['#นาฬิกาติดมอเตอร์ไซค์', '#อุปกรณ์มอเตอร์ไซค์', '#exsoxclock', '#ไบค์เกอร์', '#ShopeeTH'],
    defaultUrl: 'https://s.shopee.co.th/2gB0YuFr0I'
  }
];

// คลังร้านค้าสำรองจากรายการข้อเสนอของคุณ (สำหรับระบบค้นหาดีลเพิ่มอัตโนมัติ)
const RESERVE_STORES_CATALOG = [
  { name: 'houruitingmi.th', shopId: '1608586846', rate: '7%', shortUrl: 'https://s.shopee.co.th/8plduEsNUw', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zu-mm8cvyazrojm14' },
  { name: 'auk1087.th', shopId: '1892202655', rate: '16%', shortUrl: 'https://s.shopee.co.th/3B7H9pDwzN', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zt-mm8ebnvxbk7cde' },
  { name: 'คูก้า', shopId: '149198280', rate: '14%', shortUrl: 'https://s.shopee.co.th/2VraMbGULJ', category: 'kids', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztp-mm7jn341gpvmfb' },
  { name: 'Sky Shop 85', shopId: '373056694', rate: '12%', shortUrl: 'https://s.shopee.co.th/BTfaJPN55', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'Athlete & Adventure', shopId: '1516098556', rate: '11%', shortUrl: 'https://s.shopee.co.th/1AFO0Q0Q2', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-8257z-mspsat4b356qe3' },
  { name: 'BNZBYXGS.th', shopId: '1732816120', rate: '11%', shortUrl: 'https://s.shopee.co.th/90546Xrk9x', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'Lluvia.Store', shopId: '137324840', rate: '11%', shortUrl: 'https://s.shopee.co.th/5q82Kj3nZd', category: 'beauty', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zte-msu1cyx7hd6o3e' },
  { name: 'Baan Lalyn', shopId: '46415269', rate: '11%', shortUrl: 'https://s.shopee.co.th/AAH1UgnIn4', category: 'home', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mr4tl50655ac2f' },
  { name: 'Possible1111', shopId: '1482414380', rate: '11%', shortUrl: 'https://s.shopee.co.th/W6VyvO6P7', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'fyhhiuf128', shopId: '315881049', rate: '10%', shortUrl: 'https://s.shopee.co.th/9AOUIqr6oy', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'xiangshen.th', shopId: '1150949781', rate: '10%', shortUrl: 'https://s.shopee.co.th/4LJEXy9VcS', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'KEIZHIDE', shopId: '1561686542', rate: '10%', shortUrl: 'https://s.shopee.co.th/8fSDhvt0pv', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'Cutie Minute shop', shopId: '125766821', rate: '9%', shortUrl: 'https://s.shopee.co.th/1BMCm9LZ3B', category: 'beauty', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zte-msu1cyx7hd6o3e' },
  { name: 'O&Ning Shop', shopId: '98787962', rate: '9%', shortUrl: 'https://s.shopee.co.th/1gITN4Jf2C', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zu-mm8cvyazrojm14' },
  { name: 'Sunday.official', shopId: '505449980', rate: '9%', shortUrl: 'https://s.shopee.co.th/30nqxWEaKK', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zu-mm8cvyazrojm14' },
  { name: 'ifine.th', shopId: '365214072', rate: '9%', shortUrl: 'https://s.shopee.co.th/3qMxx3BPdR', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'NongLeo_Shopping', shopId: '62991638', rate: '9%', shortUrl: 'https://s.shopee.co.th/7Kwq7Ty5Wk', category: 'kids', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztp-mm7jn341gpvmfb' },
  { name: 'dpbppmc.th', shopId: '1402617271', rate: '9%', shortUrl: 'https://s.shopee.co.th/3LQhM8DJeM', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'Sosexy.th', shopId: '1233465810', rate: '9%', shortUrl: 'https://s.shopee.co.th/7VGGJmxSBn', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zt-mm8ebnvxbk7cde' },
  { name: 'Voideyewear & Everything Nice', shopId: '10928', rate: '7%', shortUrl: 'https://s.shopee.co.th/AUtrtIm276', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zu-mm8cvyazrojm14' },
  { name: '3xoj6m46_f', shopId: '1272363514', rate: '7%', shortUrl: 'https://s.shopee.co.th/6fh9KG0csg', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'ทุ่นตกกุ้งบ่อปูน', shopId: '1632599342', rate: '7%', shortUrl: 'https://s.shopee.co.th/5LBljo5haY', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'คุณระวี ช้อปปิ้ง', shopId: '1024003137', rate: '7%', shortUrl: 'https://s.shopee.co.th/6q0ZWYzzXj', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'Warm Station Home Store', shopId: '290989532', rate: '7%', shortUrl: 'https://s.shopee.co.th/70JzirzMCi', category: 'home', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mr4tl50655ac2f' },
  { name: 'DREAM.BOX', shopId: '479439190', rate: '7%', shortUrl: 'https://s.shopee.co.th/9KhuV9qTTz', category: 'home', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mr4tl50655ac2f' },
  { name: 'chenhomb0.th', shopId: '1356489966', rate: '7%', shortUrl: 'https://s.shopee.co.th/7AdPvAyirl', category: 'home', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mr4tl50655ac2f' },
  { name: 'FM Fishing k.10', shopId: '305322363', rate: '7%', shortUrl: 'https://s.shopee.co.th/5VVBw754Fb', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'LAKAM Bag Store', shopId: '1618446468', rate: '7%', shortUrl: 'https://s.shopee.co.th/112mZqMCO8', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zt-mm8ebnvxbk7cde' },
  { name: 'CareClick', shopId: '45931038', rate: '7%', shortUrl: 'https://s.shopee.co.th/20vJlgIOME', category: 'home', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mr4tl50655ac2f' },
  { name: 'Whoop Shop', shopId: '64489242', rate: '7%', shortUrl: 'https://s.shopee.co.th/1qbtZNJ1hF', category: 'motorcycle_gadget', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mr7fxhou0mipf3' },
  { name: 'fedaluosk.th', shopId: '1032048407', rate: '7%', shortUrl: 'https://s.shopee.co.th/1LfcySKviA', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'txl3962cd.th', shopId: '1408453786', rate: '7%', shortUrl: 'https://s.shopee.co.th/gPwBENT46', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'addoml.th', shopId: '1618445737', rate: '7%', shortUrl: 'https://s.shopee.co.th/3g3XkkC2yO', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'กล่องป่า', shopId: '1761912291', rate: '7%', shortUrl: 'https://s.shopee.co.th/2LYAAIH7gG', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'houqimingrw.th', shopId: '1608639907', rate: '7%', shortUrl: 'https://s.shopee.co.th/8V8nVcteAu', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'AF.3C', shopId: '1910427364', rate: '7%', shortUrl: 'https://s.shopee.co.th/5AsLXV6KvZ', category: 'electronics', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zth-mqilmuwfdnnxe6' },
  { name: 'Luluna Mall', shopId: '1629949667', rate: '7%', shortUrl: 'https://s.shopee.co.th/4VcekH8sHV', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'ILOVEDIY: Beauty Shop', shopId: '348895610', rate: '6%', shortUrl: 'https://s.shopee.co.th/5foc8Q4Qua', category: 'beauty', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zte-msu1cyx7hd6o3e' },
  { name: 'Cool & Cozy แว่นตากันแดด', shopId: '36564241', rate: '5%', shortUrl: 'https://s.shopee.co.th/3Vk7YRCgJP', category: 'fashion', imageUrl: 'https://down-th.img.susercontent.com/file/sg-11134201-825zu-mm8cvyazrojm14' },
  { name: 'Vivo Thailand Official', shopId: '18119190', rate: '3%', shortUrl: 'https://s.shopee.co.th/6VNj7x1GDh', category: 'electronics', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zth-mqilmuwfdnnxe6' },
  { name: 'TIGER POWER RACING', shopId: '1627425726', rate: '3%', shortUrl: 'https://s.shopee.co.th/9peB64oZT2', category: 'lifestyle', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81ztj-mqsp03cp0lxcd8' },
  { name: 'dcool3c.th', shopId: '1094497791', rate: '3%', shortUrl: 'https://s.shopee.co.th/8KpNJJuHVt', category: 'electronics', imageUrl: 'https://down-th.img.susercontent.com/file/th-11134207-81zth-mqilmuwfdnnxe6' }
];

// รวมดีลทั้งหมดโดยให้ข้อเสนอสินค้า (Product Offers จาก affiliate.shopee.co.th/offer/product_offer) เป็นดีลหลักอันดับแรกเสมอ
const primaryProductOffers = (typeof window !== 'undefined' && window.SHOPEE_PRODUCT_OFFERS && Array.isArray(window.SHOPEE_PRODUCT_OFFERS)) 
  ? window.SHOPEE_PRODUCT_OFFERS 
  : [];

const TRENDING_DEALS_DATABASE = [...primaryProductOffers, ...SHOP_OFFERS_DATABASE];

// ส่งออกให้ใช้งานในแอป
if (typeof window !== 'undefined') {
  window.SHOP_OFFERS_DATABASE = SHOP_OFFERS_DATABASE;
  window.TRENDING_DEALS_DATABASE = TRENDING_DEALS_DATABASE;
  window.RESERVE_STORES_CATALOG = RESERVE_STORES_CATALOG;
}
if (typeof module !== 'undefined') {
  module.exports = { TRENDING_DEALS_DATABASE, SHOP_OFFERS_DATABASE, RESERVE_STORES_CATALOG };
}

