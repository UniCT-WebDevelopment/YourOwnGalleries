import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

export interface IStoragePlan {
  id: number;
  name: string;
  size: number;
  description: string;
}

export interface IActualStoragePlan {
  id: number;
  usedSpace: number;
  availableSpace: number;
}

const GET_PLANS_API = "http://localhost:8000/api/storages";
const GET_ACTUAL_PLAN_API = "http://localhost:8000/api/storage";
const CHANGE_PLAN_API = "http://localhost:8000/api/storage/change/";

@Injectable({
  providedIn: "root"
})
export class StorageService {
  constructor(private http: HttpClient) {}

  getPlans(): Observable<IStoragePlan[]> {
    return this.http.get<IStoragePlan[]>(GET_PLANS_API);
  }

  getActualPlan(): Observable<IActualStoragePlan> {
    return this.http.get<IActualStoragePlan>(GET_ACTUAL_PLAN_API);
  }

  changePlan(id: number): Observable<IActualStoragePlan> {
    return this.http.put<IActualStoragePlan>(CHANGE_PLAN_API + id, {});
  }
}
