import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private http = inject(HttpClient);

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      apikey: environment.supabaseKey,
      Authorization: `Bearer ${environment.supabaseKey}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Query nhiều rows.
   * Supabase REST params: select, order, limit, offset, và filter như id=eq.1
   */
  get<T>(table: string, query: Record<string, string> = {}): Observable<T[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      params = params.set(key, value);
    }
    return this.http.get<T[]>(`${environment.supabaseUrl}/rest/v1/${table}`, {
      headers: this.headers,
      params,
    });
  }

  /**
   * Query một row duy nhất.
   */
  getOne<T>(table: string, query: Record<string, string> = {}): Observable<T> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      params = params.set(key, value);
    }
    const headers = this.headers.set('Accept', 'application/vnd.pgrst.object+json');
    return this.http.get<T>(`${environment.supabaseUrl}/rest/v1/${table}`, {
      headers,
      params,
    });
  }
}
