import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/helper/shared.service';
import { CustomSnackBarService } from '../../services/helper/custom-snack-bar.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchDialogComponent } from '../../components/search-dialog/search-dialog.component';
import { HomeService } from '../../services/home.service';
import { LocationService } from '../../services/location.service';
import * as _ from 'lodash';

export interface Data {
  city: string,
  location: string,
  citypic: string
}


@Component({
  selector: 'app-search-stay',
  templateUrl: './search-stay.component.html',
  styleUrls: ['./search-stay.component.css']
})
export class SearchStayComponent implements OnInit {
  searchResult: Data[] = [];
  totalData: Data[] = [];
  public sanitizer;

  itemSelected: boolean = false;
  nearbySelected: boolean = false;
  stayTypes:any = ['Paying Guest'];

  search = {
    name : '',
    stayType:'',
    gender:'',
    nearby:'',
    subLocation:'',
    stayPlan:''
  }
  cityAndLocationSelected: any = {};

  landMarkData: any = [];
  landMarkTotalData:any = [];
  subLocationSelected:any='';
  subLocationData:any =[];


  constructor(private _shared: SharedService, private router: Router, private _locationService: LocationService,
    private _snackBarService: CustomSnackBarService, public domSanitizer: DomSanitizer, public _homeService: HomeService
    ) { }

  ngOnInit(): void {
    this.loadDataForSearch();
    this.sanitizer = this.domSanitizer;
  }

  public selectItem(item: any) {
    this.search.name = item.locationName;
    if (item.locationName && item.locationName != '' && item.cityName && item.cityName != '' && item.cityId && item.cityId != 0 && item.locationId && item.locationId != 0) {
      this.cityAndLocationSelected.cityId = item.cityId;
      this.cityAndLocationSelected.cityName = item.cityName;
      this.cityAndLocationSelected.locationId = item.locationId;
      this.cityAndLocationSelected.locationName = item.locationName;
      this.loadNearByLocation(item.locationName, item.cityName, item.cityId, item.locationId);
    }
    this.itemSelected = true;
    this.loadSubLocationByLocationId(item.locationId);
  }
  public selectLandMark(item: any) {
    this.search.nearby = item.landMarkName;
    // if (item.locationName && item.locationName != '' && item.cityName && item.cityName != '' && item.cityId && item.cityId != 0 && item.locationId && item.locationId != 0) {
    //   this.cityAndLocationSelected.cityId = item.cityId;
    //   this.cityAndLocationSelected.cityName = item.cityName;
    //   this.cityAndLocationSelected.locationId = item.locationId;
    //   this.cityAndLocationSelected.locationName = item.locationName;
    // }
    this.nearbySelected = true;
  }

  public searchNameChange(filterString) {
    this.filterData(filterString);
    this.itemSelected = false;
  }
  public searchNearBy(filterString) {
    this.filterNearBy(filterString);
    this.nearbySelected = false;
  }
  loadNearByLocation(location, city, city_id, location_id) {
    this.landMarkTotalData=[];
    this._homeService.loadNearByLocations().subscribe((response: any) => {
      if (response.error && response.error != '') {
        this._snackBarService.errorSnackBar("Something went wrong!");
        return;
      } else {
        let responseData: any = response.data;
        if (responseData) {
          responseData.forEach(element => {
            let data: any = element;
            let cityName = data.pgStayId.subLocation.location.city.cityName;
            let cityId = data.pgStayId.subLocation.location.city.cityId;
            let locationName = data.pgStayId.subLocation.location.locationName;
            let locationId = data.pgStayId.subLocation.location.locationId;
            if (cityName == city && locationName == location && cityId == city_id && locationId == location_id) {
              let landMark: any = {};
              landMark.landMarkName = data.landMarkName;
              landMark.landMarkId = data.landMarkId;
              landMark.pgName=data.pgStayId.pgName;
              landMark.pgId=data.pgStayId.pgId;
              landMark.landMarkImage=data.landMarkImage;
              landMark.landMarkImageName=data.landMarkImageName;
              this.landMarkTotalData.push(landMark);
            }
          });
        }
      }
    },
      (error) => {
        this._snackBarService.errorSnackBar("Something went wrong!");
        return;
      });
  }
  public filterData(filterString) {
    let self = this;
    // let filteredData=_.filter(self.searchResult, (item)=>{
    //   let locationName:string=item.location;
    //   let cityName:string=item.city;
    //   if(cityName.includes(filterString) || locationName.includes(filterString)){
    //     return item;
    //   }
    // });
    let filteredData: any = [];
    for (let i = 0; i < this.totalData.length; i++) {
      let obj:any = this.totalData[i];
      if (obj.cityName.includes(filterString.toUpperCase()) || obj.locationName.includes(filterString.toUpperCase())) {
        filteredData.push(obj);
      }
    }
    // _.result(_.find(this.searchResult, function(item) {
    //                   return item.city.includes(filterString) || item.location.includes(filterString);
    //               }), 'item');
    this.searchResult = filteredData;
  }
  public filterNearBy(filterString) {
    let self = this;
    // let filteredData=_.filter(self.searchResult, (item)=>{
    //   let locationName:string=item.location;
    //   let cityName:string=item.city;
    //   if(cityName.includes(filterString) || locationName.includes(filterString)){
    //     return item;
    //   }
    // });
    let filteredData: any = [];
    for (let i = 0; i < this.landMarkTotalData.length; i++) {
      let obj:any = this.landMarkTotalData[i];
      if (obj.landMarkName.includes(filterString.toUpperCase())) {
        filteredData.push(obj);
      }
    }
    // _.result(_.find(this.searchResult, function(item) {
    //                   return item.city.includes(filterString) || item.location.includes(filterString);
    //               }), 'item');
    this.landMarkData = filteredData;
  }
  public searchSubmit() {
    var self = this;
    if (self.search.name) {
      let filterData: any = {};
      filterData.location = self.search.name;
      filterData.locationId=this.cityAndLocationSelected.locationId;
      filterData.stayType = self.search.stayType;
      filterData.gender = self.search.gender;
      filterData.nearby = self.search.nearby;
      filterData.stayPlan = self.search.stayPlan;
      self._shared.sharedData = filterData;
      let cityId=this.cityAndLocationSelected.cityId;
      let cityName=this.cityAndLocationSelected.cityName;
      let locationId=this.cityAndLocationSelected.locationId;
      let locationName=this.cityAndLocationSelected.locationName;
      let subLocationName = this.search.subLocation;
      cityName=cityName.toLowerCase().split(" ").join("-").trim();
      locationName=locationName.toLowerCase().split(" ").join("-").trim();
      subLocationName = subLocationName.toLowerCase().split(" ").join("-").trim();
      let navigateUrl:any;
      if(subLocationName && subLocationName != ''){
        navigateUrl="/pg/"+cityName+"/"+locationName+'/'+subLocationName;
      }else{
        navigateUrl="/pg/"+cityName+"/"+locationName;
      }
      self.router.navigate([navigateUrl]);
    }
  }
  loadDataForSearch() {
    let self = this;
    this._locationService.loadAllLocation().subscribe((response: any) => {
      if (response.error && response.error != '') {
        this._snackBarService.errorSnackBar('Something went wrong!');
        return;
      }
      else {
        let responseData: any = response.data[0];
        if (responseData.length > 0) {
          responseData.forEach(element => {
            let city = element.city;
            if (city && city.status == true) {
              let data: any = {};
              data.locationName = element.locationName;
              data.locationId = element.locationId;
              data.cityName = city.cityName;
              data.cityId = city.cityId;
              data.citypic = city.cityImage;
              self.searchResult.push(data);
              self.totalData.push(data);
            }
          });
        }
        else {
          this._snackBarService.successSnackBar('No Record Found!');
        }
      }
    },
      (error: any) => {

      });
  }

  loadSubLocationByLocationId(locationId){
    this._locationService.getSubLocationByLocationId(locationId).subscribe((response:any)=>{
      if (response.error && response.error != '') {
        this._snackBarService.errorSnackBar('Something went wrong!');
        return;
      }
      else {
        let responseData: any = response.data;
        if (responseData.length > 0) {
          responseData.forEach(element => {
            let exist = _.find(this.subLocationData,item=>{
              return item === element.subLocationName;
            })
            if(!exist){
              this.subLocationData.push(element.subLocationName);
            }
            console.log(this.subLocationData)
          });
        }
        else {
          //this._snackBarService.successSnackBar('No Record Found!');
          console.log('no record found for sublocations');
        }
      }
    },(error:any)=>{

    })
  }
}
