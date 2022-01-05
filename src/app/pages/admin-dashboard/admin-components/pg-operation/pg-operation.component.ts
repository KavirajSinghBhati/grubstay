import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';
import * as _ from 'lodash';
import { CityServiceService } from 'src/app/services/city-service.service';
import { CustomSnackBarService } from 'src/app/services/helper/custom-snack-bar.service';
import { SharedService } from 'src/app/services/helper/shared.service';
import { PgService } from 'src/app/services/pg.service';
import { PgGalleryDialogComponent } from './pg-gallery-dialog/pg-gallery-dialog.component';
import { PgOpDialogComponent } from './pg-op-dialog/pg-op-dialog.component';

export interface PG {
  pgId:string;
  pgName: string;
  pgDesc: string;
  pgAddress: string;
  singleMemPgPrc:string;
  doubleMemPgPrc: string;
  tripleMemPgPrc: string;
  distFromSubLoc:string;
  operation:string;
  subLocation:object;
}

@Component({
  selector: 'app-pg-operation',
  templateUrl: './pg-operation.component.html',
  styleUrls: ['./pg-operation.component.css']
})
export class PgOperationComponent implements OnInit {

  PG_DATA:PG[]=[];
  displayedColumns: string[] = ['actions', 'subLocation', 'pgName', 'pgAddress','singleMemPgPrc','doubleMemPgPrc','tripleMemPgPrc','distFromSubLoc','service'];
  dataSource = new MatTableDataSource(this.PG_DATA);
  public sanitizer;

  constructor(private dialog: MatDialog, private _cityService: CityServiceService, private _snackbarService: CustomSnackBarService, private snackBar: MatSnackBar, private domSanitier:DomSanitizer, private _sharedService:SharedService,private _pgService:PgService) {
    this.sanitizer=domSanitier;
  }

  ngOnInit(): void {
      var self = this;
      self.loadAllPgData();
  }

  public editItem(pgId) {
    let pgData=_.find(this.PG_DATA,(item:any)=>{
      return (item.pgId==pgId);
    });
    pgData.operation='edit';
    const dialogRef = this.dialog.open(PgOpDialogComponent, {
      data:pgData
    });
    console.log(pgData);
  }

  public viewGal(pgId){
    let pgData=_.find(this.PG_DATA,(item:any)=>{
      return (item.pgId==pgId);
    });
    const dialogRef = this.dialog.open(PgGalleryDialogComponent, {
      data:pgData
    });
  }

  public deleteItem(pgId) {
    let self=this;
    
  }
  openPgDialog() {
    const dialogRef = this.dialog.open(PgOpDialogComponent);
  }

  filterPg(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadAllPgData(){
    var self = this;
    self._pgService.loadAllPGData().subscribe((response:any)=>{
      if(response.error && response.error != ''){
        self._snackbarService.errorSnackBar("Couldn't fetch pg datas !");
        return;
      }else{
        let responseData:any = response.data;
          if (responseData) {
            responseData.forEach(element => {
              if(element.status==true){
                element.service='Active';
              }
              if(element.status==false){
                element.service='Inactive'
              }
            });
          }
          self.PG_DATA = responseData;
          self.dataSource = new MatTableDataSource(this.PG_DATA);
          this._snackbarService.successSnackBar("Successfully Fetched!");
      }
    },(error:any)=>{
      self._snackbarService.errorSnackBar("Couldn't fetch pg datas !");
      return;
    })
  }

}