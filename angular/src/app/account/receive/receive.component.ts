import { Component, Inject, HostBinding, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common'
import { UIState } from '../../services/ui-state.service';
import { CommunicationService } from '../../services/communication.service';
import { IconService } from '../../services/icon.service';
import { copyToClipboard } from '../../shared/utilities';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as QRCode from 'qrcode';
import { Address } from '../../interfaces';
import { NetworksService } from '../../services/networks.service';
import { Network } from '../../services/networks';
import { WalletManager } from '../../services/wallet-manager';
var QRCode2 = require('qrcode');

@Component({
    selector: 'app-account-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.css']
})
export class AccountReceiveComponent implements OnInit, OnDestroy {

    addressEntry: Address;
    address: string;
    qrCode: string;
    network: Network;

    constructor(public uiState: UIState,
        private renderer: Renderer2,
        private networks: NetworksService,
        public walletManager: WalletManager,
        private snackBar: MatSnackBar) {
        // this.uiState.title = 'Receive Address';
        this.uiState.goBackHome = false;

        const account = this.walletManager.activeAccount;
        this.network = this.networks.getNetwork(account.networkType);
    }

    ngOnDestroy(): void {

    }

    copy() {
        copyToClipboard(this.address);

        this.snackBar.open('Receive address copied to clipboard', 'Hide', {
            duration: 1500,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
        });
    }

    async ngOnInit() {
        // TODO: When can we start using .lastItem and similar functions on arrays?
        this.addressEntry = this.walletManager.activeAccount.state.receive[this.walletManager.activeAccount.state.receive.length - 1];
        this.address = this.addressEntry.address;

        try {
            this.qrCode = await QRCode.toDataURL(this.address, {
                errorCorrectionLevel: 'L',
                margin: 2,
                scale: 5,
            });

            // LEFT TO HAVE INSTRUCTIONS ON POSSIBLE OPTIONS :-)
            // this.qrCode = await QRCode.toDataURL(this.address, {
            //     // version: this.version,
            //     errorCorrectionLevel: 'L',
            //     // margin: this.margin,
            //     // scale: this.scale,
            //     // width: this.width,
            //     // color: {
            //     //     dark: this.colorDark,
            //     //     light: this.colorLight
            //     // }
            // });

        } catch (err) {
            console.error(err);
        }
    }
}