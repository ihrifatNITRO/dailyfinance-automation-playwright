import {faker} from "@faker-js/faker";

export class PersonModel {

    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    gender: 'Male' | 'Female';

    constructor() {
        this.firstName = faker.person.firstName();
        this.lastName = faker.person.lastName();
        this.email = `ihrifat.rr+${faker.number.int({min:1, max:100})}@gmail.com`;
        this.password = faker.internet.password();
        this.phoneNumber = `017${faker.number.bigInt({min: 10000000n, max: 99999999n})}`;
        this.address = faker.location.streetAddress({useFullAddress: true});
        this.gender = faker.helpers.arrayElement(['Male', 'Female']);
    }
}