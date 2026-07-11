import { Component } from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType} from '@angular/common/http';

@Component({
  selector: 'app-invoice-scanner',
  templateUrl: './invoice-scanner.html',
  styleUrl: './invoice-scanner.css',
})
export class InvoiceScanner {
  selectedFile: File | null = null;

  isUploading = false;
  uploadPercent = 0;
  private uploadUrl = 'https://ais-pre-2ibskxw2p5cq4472zcq4ke-1005464826669.europe-west2.run.app/api/extract-invoice';

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.isUploading = true;
      this.selectedFile = input.files[0];

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      console.log('sending request');
      this.http.post(this.uploadUrl, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event: HttpEvent<any>) => {
          console.log('event received');
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadPercent = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            alert('Invoice uploaded successfully! Response is ' + JSON.stringify(event.body));
            this.resetForm();
            console.log('event finished');
          }
        },
        error: (error) => {
          alert('Error uploading photo - ' + JSON.stringify(error));
          this.resetForm();
        }
      });
      console.log('mina');
    }
  }

  resetForm(): void {
    this.selectedFile = null;
    this.isUploading = false;
    this.uploadPercent = 0;
  }
}
