package com.labresource.dto.institution;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionResponse {

    private String id;

    private String name;

    private String email;

    private String phone;

    private String address;

    private String city;

    private String state;

    private String country;

    private String status;
}



//{
//        "id": "62e07288-28d8-4d7f-b2ce-40a322cc6654",
//        "name": "DY Patil International University",
//        "email": "admin@dypiu.ac.in",
//        "phone": "9876543210",
//        "address": "Akurdi",
//        "city": "Pune",
//        "state": "Maharashtra",
//        "country": "India",
//        "status": "ACTIVE"
//        }