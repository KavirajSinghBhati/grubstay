import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PgService } from '../../services/pg.service';
import { CustomSnackBarService } from '../../services/helper/custom-snack-bar.service';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { NumberFormatStyle } from '@angular/common';

export interface PG {
  pgId: string,
  pgName: string,
  pgAddress: string,
  pgSingleMemberPrice: number,
  pgSinglePriceAvail: boolean,
  pgDoubleMemberPrice: number,
  pgDoublePriceAvail: boolean,
  pgTripleMemberPrice: number,
  pgTriplePriceAvail: boolean,
  pgFourMemberPrice: number,
  pgFourPriceAvail: boolean,
  pgAbout: string,
  pgGender:string,
  pgPrice: number
}

interface Amenities {
  SecurityServeillance: boolean,
  SpeedWifi: boolean,
  DiningArea: boolean,
  DeliciousMeals: boolean,
  PowerBackup: boolean,
  TV: boolean,
  Lift: boolean,
  WashingMachine: boolean,
  ParkingArea: boolean,
  Waterfilter: boolean
}
interface Facilities {
  name: string,
  status: boolean
}
interface LandMark {
  id: number,
  str: string,
  alt: string,
  title: string
}

@Component({
  selector: 'app-pg',
  templateUrl: './pg.component.html',
  styleUrls: ['./pg.component.css']
})
export class PgComponent implements OnInit {
  pgId: any;
  fav: boolean = true;
  whatsappLink:any = '';

  pgDetails: PG = {
    pgId: '',
    pgName: '',
    pgAddress: '',
    pgSingleMemberPrice: 0,
    pgSinglePriceAvail: false,
    pgDoubleMemberPrice: 0,
    pgDoublePriceAvail: false,
    pgTripleMemberPrice: 0,
    pgTriplePriceAvail: false,
    pgFourMemberPrice: 0,
    pgFourPriceAvail: false,
    pgAbout: '',
    pgGender:'',
    pgPrice: 0
  }

  amenitiesData: Amenities[] = [];
  facilitiesData: Facilities[] = [];

  pgAmen = [
    { dbName: 'securitySurvialance', name: '24x7 Security Serveillance', src: '../../../assets/imgs/amenities/cctv.png' },
    { dbName: 'wifi', name: 'High-Speed Wifi', src: '../../../assets/imgs/amenities/wifi.png' },
    { dbName: 'diningArea', name: 'Dining Area', src: '../../../assets/imgs/amenities/dining.png' },
    { dbName: 'meals', name: 'Delicious Meals', src: '../../../assets/imgs/amenities/meals.png' },
    { dbName: 'powerBackUp', name: 'Power Backup', src: '../../../assets/imgs/amenities/power.png' },
    { dbName: 'tv', name: 'TV', src: '../../../assets/imgs/amenities/tv.png' },
    { dbName: 'lift', name: 'Lift', src: '../../../assets/imgs/amenities/lift.png' },
    { dbName: 'washingMachine', name: 'Washing Machine', src: '../../../assets/imgs/amenities/washing.png' },
    { dbName: 'parkingArea', name: 'Parking Area', src: '../../../assets/imgs/amenities/parking.png' },
    { dbName: 'waterFilter', name: 'Water Filter', src: '../../../assets/imgs/amenities/water.png' },
  ]


  pgRoomFac = [
    { dbName: 'attachedWashroom', name: 'Attached Bathroom', src: '../../../assets/imgs/room-facility/bath.png' },
    { dbName: 'bedWithMattress', name: 'Bed With Matress', src: '../../../assets/imgs/room-facility/bed.png' },
    { dbName: 'ceilingFan', name: 'Ceiling Fan', src: '../../../assets/imgs/room-facility/fans.png' },
    { dbName: 'hotWatersupply', name: 'Hot Water Supply', src: '../../../assets/imgs/room-facility/hotwater.png' },
    { dbName: 'tvDth', name: 'TV with DTH', src: '../../../assets/imgs/room-facility/tv.png' },
    { dbName: 'wardrobe', name: 'Wardrobes', src: '../../../assets/imgs/room-facility/wardrobe.png' },
    { dbName: 'safetyLocker', name: 'Saftey Lockers', src: '../../../assets/imgs/room-facility/locker.png' },
    { dbName: 'tableChair', name: 'Tables & Chairs', src: '../../../assets/imgs/room-facility/chairs.png' }
  ]

  pgPrices = [
    { name: 'Triple Occupency', price: '5000/month' },
    { name: 'Double Occupency', price: '6500/month' },
    { name: 'Single Occupency', price: '8500/month' }
  ];

  nearbyLandmarks: LandMark[] = [];

  pgAbout = 'Situated in a prime location, this house has everything you need. all you need to do is pack your bags and move-in';

  pgGallery: any = [];

  carouselOptions: OwlOptions = {
    loop: true,
    margin: 20,
    // autoWidth:true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 3
      },
      400: {
        items: 3
      },
      740: {
        items: 6
      },
      940: {
        items: 6
      }
    },
    nav: false
  }
  pgCarousel: OwlOptions = {
    items: 1,
    dots: true,
    nav: false,
    loop: true,
    autoplay:true,
    navSpeed: 700,
    touchDrag:true,
    mouseDrag:true,
    pullDrag: true,
  }
  sanitizer;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, private _route: ActivatedRoute, private _pgService: PgService, private _snackBarService: CustomSnackBarService, private _sanitizer: DomSanitizer,private title:Title) {
    this.sanitizer = _sanitizer;
    this.setTitle('Grubstay - Paying Guest');
  }

  ngOnInit(): void {
    var self = this
    let data:any={};
    let params:any=this._route.snapshot.params;
    this.whatsappLink = 'grubstay.com/pg/'+params.cityName+'/'+params.locationName+'/'+params.subLocationName+'/'+params.pgName;
    data.cityName=params.cityName.split('-').join(' ').toUpperCase();
    data.locationName=params.locationName.split('-').join(' ').toUpperCase();
    data.subLocationName=params.subLocationName.split('-').join(' ').toUpperCase();
    data.pgName=params.pgName.split('-').join(' ').toUpperCase();
    if (data) {
      this.loadPgData(data);
      this.loadPgGallery(data);
      this.loadLandMark(data);
    }
  }

  public loadPgData(pgId) {
    this._pgService.loadPgData(pgId).subscribe((response: any) => {
      if (response.error && response.error != '') {
        this._snackBarService.errorSnackBar("Something went wrong");
        return;
      }
      else {
        let responseData = response.data;
        if (responseData) {
          let pgData = responseData[0];
          let amenitiesData: any = responseData[0].amenitiesServices;
          let facilityData: any = responseData[0].roomFacility;
          if (pgData) {
            this.pgDetails.pgId = pgData.pgId;
            this.pgDetails.pgName = pgData.pgName;
            this.pgDetails.pgAddress = pgData.pgAddress;
            this.pgDetails.pgAbout = pgData.pgDesc;
            this.pgDetails.pgGender = pgData.pgGender;
            this.pgDetails.pgPrice = (pgData.singleMemPgPrc && pgData.singleMemPgPrc != 0) ? pgData.singleMemPgPrc : (pgData.doubleMemPgPrc && pgData.doubleMemPgPrc != 0) ? pgData.doubleMemPgPrc : pgData.tripleMemPgPrc;
            if (pgData.singleMemPgPrc && pgData.singleMemPgPrc != 0) {
              this.pgDetails.pgSingleMemberPrice = pgData.singleMemPgPrc;
              this.pgDetails.pgSinglePriceAvail = true;
            }
            if (pgData.doubleMemPgPrc && pgData.doubleMemPgPrc != 0) {
              this.pgDetails.pgDoubleMemberPrice = pgData.doubleMemPgPrc;
              this.pgDetails.pgDoublePriceAvail = true;
            }
            if (pgData.tripleMemPgPrc && pgData.tripleMemPgPrc != 0) {
              this.pgDetails.pgTripleMemberPrice = pgData.tripleMemPgPrc;
              this.pgDetails.pgTriplePriceAvail = true;
            }
            if (pgData.fourMemPgPrc && pgData.fourMemPgPrc != 0) {
              this.pgDetails.pgFourMemberPrice = pgData.fourMemPgPrc;
              this.pgDetails.pgFourPriceAvail = true;
            }
          }
          if (amenitiesData) {
            let tempAmen = [];
            let amenKeys = Object.entries(amenitiesData).filter(([, v]) => v == true).map(([k]) => k);
            this.pgAmen.forEach(obj => {
              let dbName = obj.dbName;
              amenKeys.forEach(obj1 => {
                if (obj1 == dbName) {
                  tempAmen.push(obj);
                }
              })
            });
            this.pgAmen = tempAmen;
          }
          if (facilityData) {
            let tempFac = [];
            let facKeys = Object.entries(facilityData).filter(([, v]) => v == true).map(([k]) => k);
            this.pgRoomFac.forEach(obj => {
              let dbName = obj.dbName;
              facKeys.forEach(obj1 => {
                if (obj1 == dbName) {
                  tempFac.push(obj);
                }
              })
            });
            this.pgRoomFac = tempFac;
          }
        }
        else {
          this._snackBarService.errorSnackBar("PG Not found!");
          return;
        }
      }
    },
      (error) => {
        this._snackBarService.errorSnackBar("Something went wrong!");
      });
  }
  loadPgGallery(data) {
    var self = this;
    self._pgService.getGalleryByPgId(data).subscribe((response: any) => {
      if (response.error && response.error != '') {
        self._snackBarService.errorSnackBar("failed to load pg images...!");
        return;
      } else {
        let responseData: any = response.data;
        if (responseData.length > 0) {
          self.pgGallery = responseData;
        }
      }
    }, (error) => {
      self._snackBarService.errorSnackBar("failed to load pg images...!");
      return;
    })
  }
  loadLandMark(data) {
    this._pgService.loadLandMark(data).subscribe((response: any) => {
      if (response.error && response.error != '') {
        this._snackBarService.errorSnackBar("Something went wrong!");
        return;
      }
      else {
        let total = response.total;
        if (total > 0) {
          let responseData: any = response.data;
          if (responseData) {
            responseData.forEach(obj => {
              let landMarkObj: any = {};
              if (obj.landMarkImageName && obj.landMarkImageName != '') {
                landMarkObj.id = obj.landMarkId;
                landMarkObj.src = obj.landMarkImage;
                landMarkObj.alt = obj.landMarkImageName;
                landMarkObj.title = obj.landMarkName;
                this.nearbyLandmarks.push(landMarkObj);
              }
            });
          }
        }
      }
    },
      (error) => {
        this._snackBarService.errorSnackBar("Something went wrong!");
      })
  }
  public toggleFav() {
    var self = this;
    self.fav = self.fav ? false : true;
  }

  public sharePg() {
    var self = this;
  }

  public setTitle(newTitle:string){
    this.title.setTitle(newTitle);
  }

}
