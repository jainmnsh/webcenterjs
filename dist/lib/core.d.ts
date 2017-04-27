/**
 * @license
 * Copyright (c) 2017 Rakesh Gajula.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { AxiosRequestConfig } from "axios";
import * as Common from "./types/common";
import * as SiteStructure from "./types/sitestructure";
export declare function getResourceUrlFromLinks(links: Common.LinkElement[], resourceType: string, rel: string): string;
/**
 * Gets the ResourceUrl based on the following params.
 * This method is specifically designed to work with Webcenter REST API [Link Model](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABDHGHA)
 * @param resourceType Parameter [Resource Type](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABGIABJ)
 * @param rel Parameter [Relationship](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABDJBBJ)
 * @param parameters key/value pairs to replace query parameter placeholders in [Templates](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm#BABCEBGB)
 * @param projection One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 * @param startIndex One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 * @param itemsPerPage One of the **Common Request Query Parameters** defined [Here](http://docs.oracle.com/cd/E23549_01/webcenter.1111/e10148/jpsdg_rest_api.htm)
 */
export declare function getResourceUrl(resourceType: string, rel?: string): Promise<string>;
export declare function getPersonResourceUrl(person: Common.PersonReference, resourceType: string, rel: string): string;
export declare function getTemplateItem(items: Common.LinkElement[], type: string): Common.LinkElement;
export declare function doGet(serviceUrlSuffix: string, params?: {}, httpOptions?: AxiosRequestConfig): Promise<any>;
export declare function doPut(serviceUrlSuffix: string, data: any, params?: {}, httpOptions?: AxiosRequestConfig): Promise<any>;
export declare function doPost(serviceUrlSuffix: string, data: any, params?: {}, httpOptions?: AxiosRequestConfig): Promise<any>;
export declare function doDelete(serviceUrlSuffix: string, params?: {}, httpOptions?: AxiosRequestConfig): Promise<any>;
export declare function getNavigations(): Promise<SiteStructure.RESTSiteStructureContext>;
export declare function getResourceTypes(): Promise<Common.ResourceTypes>;
