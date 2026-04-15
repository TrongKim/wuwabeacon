import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Contributor {
  id: number;
  name: string;
  photo: string;
  server: string;
  department: string;
  role: string;
  contributions: string[];
  linkDiscord: string;
}

interface Department {
  name: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-contribute',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contribute.component.html',
})
export class ContributeComponent {
  selectedDepartment = signal<string | null>(null);

  departments: Department[] = [
    { name: 'Development', description: 'Xây dựng website từ những ý tưởng và vận hành nó', color: 'from-[#60a5fa] to-[#38bdf8]' },
    { name: 'Translation', description: 'Dịch nội dung thông tin từ game sang tiếng Việt', color: 'from-[#38bdf8] to-[#0ea5e9]' },
    { name: 'Designer', description: 'Thiết kế website cũng như infographic', color: 'from-[#8b5cf6] to-[#7c3aed]' },
    { name: 'Theorycrafter', description: 'Những người đã tính toán excel lỏ, nerd', color: 'from-[#f59e0b] to-[#d97706]' },
    { name: 'Guide Writer', description: 'Cũng là nerd nhưng văn lắm vl', color: 'from-[#34d399] to-[#10b981]' },
  ];

  contributors: Contributor[] = [
    { id: 1, name: 'Meap', photo: '/tribute/meap.jpg', server: 'Sóng Gió Hú', department: 'Designer', role: 'UI/UX Designer', contributions: ['Designer', 'UI/UX', 'Theorycrafter', 'Translation', 'Donation', 'Chủ Trại Giam'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 2, name: 'Squid~', photo: '/tribute/muc.jpg', server: 'Sóng Gió Hú', department: 'Guide Writer', role: 'Theorycrafter', contributions: ['Translation', 'Guide Writer', 'Donation', 'LBGT'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 3, name: 'Trọng Kim', photo: '/tribute/kim.jpg', server: 'Sóng Gió Hú', department: 'Development', role: 'Frontend / Deployment', contributions: ['Development', 'Frontend Developer', 'Maintain'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 4, name: 'Twisna', photo: '/tribute/tanish.png', server: 'Sóng Gió Hú', department: 'Development', role: 'Technical Lead', contributions: ['Translation', 'Database', 'Data Mining'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 6, name: 'Thuwthuw', photo: '/tribute/thu.png', server: 'Sóng Gió Hú', department: 'Designer', role: 'Infographic', contributions: ['Designer', 'Infographic', 'Quản Ngục'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 10, name: 'AAA-Battery', photo: '/tribute/battery.png', server: 'Sóng Gió Hú', department: 'Translation', role: 'Translation', contributions: ['Translation', 'Theorycrafter'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 8, name: 'Maiyon', photo: '/tribute/maiyon.jpg', server: 'Sóng Gió Hú', department: 'Development', role: 'Development', contributions: ['Development', 'Data Mining'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 5, name: 'Kabe', photo: '/tribute/kabe.jpg', server: 'Sóng Gió Hú', department: 'Designer', role: 'UI/UX Designer', contributions: ['Designer', 'UI/UX', 'Figma'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 16, name: 'Neck', photo: '/tribute/khodam.png', server: 'Sóng Gió Hú', department: 'Guide Writer', role: 'Guide Writer', contributions: ['Guide Writer'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 12, name: 'Kinzyl', photo: '/tribute/kinzyl.png', server: 'Kuni Wuwa', department: 'Theorycrafter', role: 'Theorycrafter', contributions: ['Theorycrafter'], linkDiscord: 'https://discord.gg/hatRjANXx8' },
    { id: 7, name: 'Clown', photo: '/tribute/clown.png', server: 'Sóng Gió Hú', department: 'Translation', role: 'Translation', contributions: ['Translation'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 9, name: 'Phan', photo: '/tribute/phan.jpg', server: 'Sóng Gió Hú', department: 'Translation', role: 'Translation', contributions: ['Translation'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 11, name: 'Shu', photo: '/tribute/shu.jpg', server: 'Sóng Gió Hú', department: 'Translation', role: 'Translation', contributions: ['Translation'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 14, name: 'Đào Việt Nam', photo: '/tribute/dao.png', server: 'Sóng Gió Hú', department: 'Translation', role: 'Translation', contributions: ['Translation'], linkDiscord: 'http://discord.gg/songgiohu' },
    { id: 15, name: 'Loran', photo: '/tribute/loran.png', server: 'Sóng Gió Hú', department: 'Translation', role: 'Translation', contributions: ['Translation'], linkDiscord: 'http://discord.gg/songgiohu' },
  ];

  get filteredContributors(): Contributor[] {
    const dept = this.selectedDepartment();
    return dept ? this.contributors.filter((c) => c.department === dept) : this.contributors;
  }

  getDeptColor(dept: string): string {
    return this.departments.find((d) => d.name === dept)?.color ?? 'from-[#374151] to-[#4b5563]';
  }

  countByDept(name: string): number {
    return this.contributors.filter((c) => c.department === name).length;
  }

  toggleDept(name: string): void {
    this.selectedDepartment.update((v) => (v === name ? null : name));
  }
}
