import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CityDialogComponent } from '../../admin-components/city/city-components/city-dialog/city-dialog.component';
import { CityServiceService } from '../../../../services/city-service.service';
import { CustomSnackBarService } from '../../../../services/helper/custom-snack-bar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from '../../../../services/helper/shared.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

export interface City {
  cityId: number;
  cityName: string;
  cityImageName: string;
  cityImage: string;
  status: string;
  service: string;
  operation: string;
}


@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})


export class CityComponent implements OnInit,AfterViewInit {
  CITY_DATA: City[] = [];
  displayedColumns: string[] = ['actions', 'position', 'cityImage', 'cityName', 'service'];
  dataSource = new MatTableDataSource(this.CITY_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  public sanitizer;

  constructor(private dialog: MatDialog, private _cityService: CityServiceService, private _snackbarService: CustomSnackBarService, private snackBar: MatSnackBar, private domSanitier: DomSanitizer, private _sharedService: SharedService, private loader: NgxUiLoaderService) {
    this.sanitizer = domSanitier;
  }

  ngOnInit(): void {
    this.loadCityData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public editItem(cityId) {
    let cityData = _.find(this.CITY_DATA, (item: any) => {
      return (item.cityId == cityId);
    });
    cityData.operation = 'edit';
    const dialogRef = this.dialog.open(CityDialogComponent, {
      width: '500px',
      height: '500px',
      disableClose: true,
      data: cityData
    });
    console.log(cityData);
  }

  public deleteItem(cityId) {
    let self = this;
    let confirmStatus:boolean = window.confirm('Are you sure, You want to delete this City!');
    if (confirmStatus == true) {
      if (cityId) {
        this.loader.start();
        self._cityService.deleteCity(cityId).subscribe((response: any) => {
          if (response.error && response.error != '') {
            this._snackbarService.errorSnackBar("Deletion Failed...Try Again!");
            this.loader.stop();
            return;
          } else {
            let deleteStatus = response.success;
            if (deleteStatus == 'deleted') {
              //this._snackbarService.successSnackBar("City Deleted Successfully!");
              this._sharedService.redirectTo('/admin/city');
            }
          }
          this.loader.stop();
        }, (error) => {
          this._snackbarService.errorSnackBar("Deletion Failed...Try Again!");
          this.loader.stop();
          return;
        })
      }
    }
    else{
      this._snackbarService.successSnackBar('City Deletion Cancelled!');
      this.loader.stop();
      return;
    }
  }
  openCityDialog() {
    const dialogRef = this.dialog.open(CityDialogComponent, {
      width: '500px',
      height: '500px',
      disableClose: true
    });
  }

  filterCity(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  loadCityData() {
    this.loader.start();
    this._cityService.loadAllCity().subscribe(
      (response: any) => {
        if (response.erorr && response.error != '') {
          this._snackbarService.errorSnackBar("Something went wrong!...Please Try Again");
          this.loader.stop();
          return;
        } else {
          let responseData: any = response.data;
          if (responseData) {
            responseData.forEach(element => {
              if (element.status == true) {
                element.service = 'Active';
              }
              if (element.status == false) {
                element.service = 'Inactive'
              }
            });
            this.CITY_DATA = responseData;
            this.dataSource = new MatTableDataSource(this.CITY_DATA);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
          this.loader.stop();
          //this._snackbarService.successSnackBar("Successfully Fetched!");
        }
      },
      (error: any) => {
        this._snackbarService.errorSnackBar("Something went wrong!...Please Try Again");
        this.loader.stop();
        return;
      });
  }
}
