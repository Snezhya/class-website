import { DEFAULT_BRAND } from '../constants/brand';

export interface Member {
  id: string;
  name: string;
  nis: string;
  role: string;
  isCore: boolean;
  bio: string;
  skills: string[];
  socialLinks: {
    github?: string;
    instagram?: string;
    linkedin?: string;
  };
  status: 'active' | 'away' | 'offline';
  image: string;
  order: number;
  /** Nomor absen kelas (satu sumber untuk council, roster, daftar absen) */
  absen: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
  category: string;
}

export interface ScheduleItem {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'theory' | 'practical' | 'exam';
}

export interface ClassNote {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'note' | 'log';
  category: 'System' | 'Academic' | 'Class' | 'General';
  isPinned: boolean;
  date: string;
  author: string;
}

/** Foto tambahan di dalam satu album (selain sampul) */
export interface GalleryPhoto {
  id: string;
  image: string;
  sortOrder: number;
}

/** Album = 1 sampul di halaman; galeri lengkap saat dibuka */
export interface GalleryAlbum {
  id: string;
  title: string;
  category: 'Practicum' | 'Event' | 'Exam' | 'Classroom';
  description: string;
  coverImage: string;
  date: string;
  photos: GalleryPhoto[];
}

/** @deprecated gunakan GalleryAlbum */
export type GalleryItem = GalleryAlbum & { image?: string };

export interface SystemSettings {
  theme: 'dark-navy' | 'dark-slate' | 'pure-black';
  accentColor: '#3b82f6' | '#10b981' | '#f59e0b' | '#ef4444' | '#8b5cf6' | '#06b6d4';
  backgroundType: 'gradient' | 'grid' | 'dot' | 'image';
  backgroundImage: string;
  blurIntensity: number; // 0 to 20px
  opacity: number; // 0 to 100
  glowAmount: number; // 0 to 100
  showHero: boolean;
  showStats: boolean;
  showSchedulePreview: boolean;
  showActivityLog: boolean;
  showAttendancePreview: boolean;
  heroTitle: string;
  heroSubtitle: string;
  logoHeader: string;
  logoFavicon: string;
  logoAdmin: string;
  logoPlaceholder: string;
  brandTitle: string;
  brandSubtitle: string;
}

export const initialMembers: Member[] = [
  {
    id: '1',
    name: 'Muhammad Fajar',
    nis: '23.01.2045',
    role: 'Ketua Kelas',
    isCore: true,
    bio: 'Lead coordinator for XI TJKT 1. Passionate about Cisco Networking and Open Source Linux administration.',
    skills: ['Cisco Packet Tracer', 'MikroTik MTCNA', 'Linux Admin', 'Bash Scripting'],
    socialLinks: { github: 'https://github.com', instagram: 'https://instagram.com' },
    status: 'active',
    image: '/hu-tao-placeholder.png',
    order: 1,
    absen: 1,
  },
  {
    id: '2',
    name: 'Aulia Rahmawati',
    nis: '23.01.2046',
    role: 'Wakil Ketua Kelas',
    isCore: true,
    bio: 'Managing class operations and ensuring structural workflow, specialist in fiber optic distribution systems.',
    skills: ['Fiber Optics', 'Network Topology Design', 'System Documentation'],
    socialLinks: { instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
    status: 'active',
    image: '/hu-tao-placeholder.png',
    order: 2,
    absen: 2,
  },
  {
    id: '3',
    name: 'Dimas Aditya',
    nis: '23.01.2047',
    role: 'Seksi IT & Server',
    isCore: true,
    bio: 'Self-taught Full Stack Developer and Network Security researcher. Managing the class homelab.',
    skills: ['React', 'TypeScript', 'Docker', 'Proxmox VE', 'Debian Linux'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    status: 'active',
    image: '/hu-tao-placeholder.png',
    order: 3,
    absen: 3,
  },
  {
    id: '4',
    name: 'Siti Lestari',
    nis: '23.01.2048',
    role: 'Sekretaris',
    isCore: true,
    bio: 'Responsible for document control, attendance tracking, and keeping notes of every coordination meeting.',
    skills: ['Technical Writing', 'Data Entry', 'Google Workspace', 'Trello'],
    socialLinks: { instagram: 'https://instagram.com' },
    status: 'away',
    image: '/hu-tao-placeholder.png',
    order: 4,
    absen: 4,
  },
  {
    id: '5',
    name: 'Bagus Pratama',
    nis: '23.01.2049',
    role: 'Bendahara',
    isCore: true,
    bio: 'Financial strategist managing the class cashflow, event budgeting, and accounting books.',
    skills: ['Budgeting', 'Financial Auditing', 'Microsoft Excel', 'Inventory Management'],
    socialLinks: { instagram: 'https://instagram.com' },
    status: 'offline',
    image: '/hu-tao-placeholder.png',
    order: 5,
    absen: 5,
  },
  {
    id: '6',
    name: 'Aditya Nugroho',
    nis: '23.01.2050',
    role: 'Anggota',
    isCore: false,
    bio: 'Interest in cybersecurity operations and CCNA routing and switching.',
    skills: ['Routing Protocols', 'Wireshark', 'Subnetting'],
    socialLinks: { github: 'https://github.com' },
    status: 'active',
    image: '/hu-tao-placeholder.png',
    order: 6,
    absen: 6,
  },
  {
    id: '7',
    name: 'Dewi Anggraini',
    nis: '23.01.2051',
    role: 'Anggota',
    isCore: false,
    bio: 'Aspiring Network Engineer focused on cloud computing and AWS virtualization.',
    skills: ['Cloud Practitioner', 'AWS Console', 'Linux Server'],
    socialLinks: { linkedin: 'https://linkedin.com' },
    status: 'active',
    image: '/hu-tao-placeholder.png',
    order: 7,
    absen: 7,
  },
  {
    id: '8',
    name: 'Eko Prasetyo',
    nis: '23.01.2052',
    role: 'Anggota',
    isCore: false,
    bio: 'Hardware geek who loves building servers and managing LAN cables.',
    skills: ['Cabling Cat6/RJ45', 'Hardware Troubleshooting', 'Samba Share'],
    socialLinks: { github: 'https://github.com' },
    status: 'away',
    image: '/hu-tao-placeholder.png',
    order: 8,
    absen: 8,
  },
  {
    id: '9',
    name: 'Fitriani Indah',
    nis: '23.01.2053',
    role: 'Anggota',
    isCore: false,
    bio: 'Creative division, managing class media designs, social profiles, and class gallery curation.',
    skills: ['Figma', 'Adobe Photoshop', 'UI/UX Design'],
    socialLinks: { instagram: 'https://instagram.com' },
    status: 'active',
    image: '/hu-tao-placeholder.png',
    order: 9,
    absen: 9,
  },
  {
    id: '10',
    name: 'Gilang Ramadhan',
    nis: '23.01.2054',
    role: 'Anggota',
    isCore: false,
    bio: 'Wireless networks and microwave transmission systems enthusiast.',
    skills: ['MikroTik Wireless', 'Access Point Config', 'RF Fundamentals'],
    socialLinks: { github: 'https://github.com' },
    status: 'offline',
    image: '/hu-tao-placeholder.png',
    order: 10,
    absen: 10,
  },
];

export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Praktikum Konfigurasi OSPF Multi-Area',
    description: 'Konfigurasi OSPF routing protokol dengan Cisco Packet Tracer pada 3 router area berbeda.',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-05-24',
    category: 'Jaringan'
  },
  {
    id: 't2',
    title: 'Laporan Instalasi Proxmox VE & KVM VM',
    description: 'Menulis dokumentasi deployment VM Debian di Proxmox Server Lab TJKT.',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-05-28',
    category: 'Administrasi Sistem'
  },
  {
    id: 't3',
    title: 'Ujian Tengah Semester: Teori Transmisi Data',
    description: 'Mempelajari modul multiplexing, modulation, dan media transmisi kabel vs wireless.',
    priority: 'high',
    status: 'pending',
    dueDate: '2026-05-22',
    category: 'Teori'
  },
  {
    id: 't4',
    title: 'Cabling & Crimping Fiber Optik Pigtail',
    description: 'Penyambungan FO menggunakan fusion splicer di workshop TJKT lantai 2.',
    priority: 'low',
    status: 'completed',
    dueDate: '2026-05-18',
    category: 'Praktikum'
  }
];

export const initialSchedule: ScheduleItem[] = [
  {
    id: 's1',
    day: 'Senin',
    time: '07:00 - 09:30',
    subject: 'Administrasi Sistem Jaringan (ASJ)',
    teacher: 'Pak Joko Purwanto, S.Kom',
    room: 'Lab Jaringan & Server',
    type: 'practical'
  },
  {
    id: 's2',
    day: 'Senin',
    time: '09:45 - 12:00',
    subject: 'Teknologi Layanan Jaringan (TLJ)',
    teacher: 'Bu Sri Wahyuni, M.T',
    room: 'Lab VoIP & Fiber Optic',
    type: 'practical'
  },
  {
    id: 's3',
    day: 'Selasa',
    time: '07:00 - 10:15',
    subject: 'Administrasi Infrastruktur Jaringan (AIJ)',
    teacher: 'Pak Eko Hendrawan, S.Pd',
    room: 'Lab Cisco & MikroTik',
    type: 'practical'
  },
  {
    id: 's4',
    day: 'Rabu',
    time: '08:30 - 10:30',
    subject: 'Matematika Terapan IT',
    teacher: 'Bu Kartini, M.Pd',
    room: 'Ruang Kelas XI TJKT 1',
    type: 'theory'
  },
  {
    id: 's5',
    day: 'Kamis',
    time: '07:00 - 09:30',
    subject: 'Keamanan Jaringan & Pentesting',
    teacher: 'Pak Joko Purwanto, S.Kom',
    room: 'Lab Server',
    type: 'practical'
  },
  {
    id: 's6',
    day: 'Jumat',
    time: '08:00 - 10:00',
    subject: 'Pendidikan Agama & Budi Pekerti',
    teacher: 'Pak Ahmad Fauzi, S.Ag',
    room: 'Ruang Kelas XI TJKT 1',
    type: 'theory'
  }
];

export const initialNotes: ClassNote[] = [
  {
    id: 'n1',
    title: 'Aturan Penggunaan Lab Cisco & Server Baru',
    content: 'Diberitahukan kepada seluruh siswa XI TJKT 1, bahwa dilarang membawa makanan/minuman ke dalam ruang lab. Setiap selesai praktikum, pastikan semua PC dimatikan dengan shutdown rapi dan kabel dirapikan kembali ke gantungan.',
    type: 'announcement',
    category: 'Class',
    isPinned: true,
    date: '2026-05-19',
    author: 'Muhammad Fajar (Ketua Kelas)'
  },
  {
    id: 'n2',
    title: 'Pengumpulan Laporan Praktikum ASJ di Google Drive',
    content: 'Format penulisan laporan PDF: XI-TJKT-1_LAPORAN-ASJ_NAMA.pdf. Batas pengumpulan maksimal hari Kamis ini pukul 23:59 WIB pada folder Drive yang sudah disebarkan di WhatsApp grup kelas.',
    type: 'note',
    category: 'Academic',
    isPinned: false,
    date: '2026-05-18',
    author: 'Siti Lestari'
  },
  {
    id: 'n3',
    title: 'System Initialized & Storage Sync Active',
    content: 'Portals CMS initialized with local persistence module. Local storage sync verified, auth module mounted at auth_session_init.sh.',
    type: 'log',
    category: 'System',
    isPinned: false,
    date: '2026-05-20',
    author: 'SYSTEM DAEMON'
  }
];

export const initialGallery: GalleryAlbum[] = [
  {
    id: 'g1',
    title: 'Fusion Splicing Fiber Optic Practicum',
    category: 'Practicum',
    description: 'Siswa kelas XI TJKT 1 melakukan penyambungan serat optik core-to-core menggunakan Fujikura Fusion Splicer.',
    coverImage: '/hu-tao-placeholder.png',
    date: '2026-05-10',
    photos: [
      { id: 'g1-p1', image: '/hu-tao-placeholder.png', sortOrder: 1 },
      { id: 'g1-p2', image: '/hu-tao-placeholder.png', sortOrder: 2 },
    ],
  },
  {
    id: 'g2',
    title: 'Server Rack Assembly & Cabling Lan',
    category: 'Classroom',
    description: 'Merakit switch, patch panel, dan router Mikrotik CCR ke dalam rack server baru milik lab sekolah.',
    coverImage: '/hu-tao-placeholder.png',
    date: '2026-05-12',
    photos: [],
  },
  {
    id: 'g3',
    title: 'Ujian Kompetensi Keahlian (UKK) Jaringan',
    category: 'Exam',
    description: 'Sesi evaluasi konfigurasi VLAN, Routing, dan bandwidth management bersama penguji industri.',
    coverImage: '/hu-tao-placeholder.png',
    date: '2026-05-15',
    photos: [{ id: 'g3-p1', image: '/hu-tao-placeholder.png', sortOrder: 1 }],
  },
];

export const defaultSettings: SystemSettings = {
  theme: 'dark-navy',
  accentColor: '#3b82f6',
  backgroundType: 'dot',
  backgroundImage: '/hu-tao-placeholder.png',
  blurIntensity: 8,
  opacity: 85,
  glowAmount: 40,
  showHero: true,
  showStats: true,
  showSchedulePreview: true,
  showActivityLog: true,
  showAttendancePreview: true,
  heroTitle: 'XI TJKT 1 PORTAL',
  heroSubtitle: 'Networking & Telecommunications Systems Developer Terminal. SMKN 1 Boyolali Class Hub.',
  logoHeader: DEFAULT_BRAND.logoHeader,
  logoFavicon: DEFAULT_BRAND.logoFavicon,
  logoAdmin: DEFAULT_BRAND.logoAdmin,
  logoPlaceholder: DEFAULT_BRAND.logoPlaceholder,
  brandTitle: DEFAULT_BRAND.brandTitle,
  brandSubtitle: DEFAULT_BRAND.brandSubtitle,
};
