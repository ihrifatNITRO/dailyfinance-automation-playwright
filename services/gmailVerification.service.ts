import {request} from "@playwright/test";
import * as dotenv from "dotenv";
dotenv.config();

async function fetchId(){

    const api = await request.newContext(
        {
            baseURL: "https://gmail.googleapis.com",
            extraHTTPHeaders: {
                "Authorization": `Bearer ${process.env.GMAIL_ACCESS_TOKEN}`
            }
        }
    );

    const response = await api.get(
        "/gmail/v1/users/me/messages"
    );
    let data = await response.json();
    //console.log(data);

    let emailId = await data.messages[0].id;
    return emailId;
}


export async function fetchEmail(){
    const emailId = await fetchId();

    const api = await request.newContext(
        {
            baseURL: "https://gmail.googleapis.com",
            extraHTTPHeaders: {
                "Authorization": `Bearer ${process.env.GMAIL_ACCESS_TOKEN}`
            }
        }
    );

    const response = await api.get(
        "/gmail/v1/users/me/messages/"+emailId
    );
    let reponseData = await response.json();
    let latestEmail = reponseData.snippet;

    return latestEmail;
}


export async function fetchResetEmail(){
    const emailId = await fetchId();
    const api = await request.newContext(
        {
            baseURL: "https://gmail.googleapis.com",
            extraHTTPHeaders: {
                "Authorization": `Bearer ${process.env.GMAIL_ACCESS_TOKEN}`
            }
        }
    );

    const response = await api.get(
        "/gmail/v1/users/me/messages/" + emailId
    );
    let reponseData = await response.json();
    let latestEmail = reponseData.snippet;

    // Extract the URL starting with http/https from the email snippet
    let urlMatch = latestEmail.match(/https?:\/\/[^\s]+/);
    let resetLink = urlMatch ? urlMatch[0] : null;

    return resetLink;
}