export interface VehicleData {
  kayitNo: string;
  cihazNo: string;
  plaka: string;
  surucu: string;
  ilkMesafe: number;
  ilkMesafeTarih: string;
  sonMesafe: number;
  sonMesafeTarih: string;
  toplamMesafe: number;
}

export interface ExcelUploadHistory {
  id: string;
  uploadDate: string;
  fileName: string;
  data: VehicleData[];
  updatedVehicles: number;
  warningCount: number;
}

export type ExcelUploadHistoryList = ExcelUploadHistory[]; 