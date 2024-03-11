package com.monitor.server;
import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.FileOutputStream;
import java.sql.*;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.*;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.CategoryLabelPositions;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.labels.CategoryItemLabelGenerator;
import org.jfree.chart.labels.ItemLabelAnchor;
import org.jfree.chart.labels.ItemLabelPosition;
import org.jfree.chart.labels.StandardCategoryItemLabelGenerator;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.CategoryItemRenderer;
import org.jfree.chart.renderer.xy.XYLineAndShapeRenderer;
import org.jfree.chart.ui.HorizontalAlignment;
import org.jfree.chart.ui.TextAnchor;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.time.*;

import javax.print.Doc;

public class pdfWriter implements Runnable {
    private static Connection con;
    private static PdfWriter writer;
    private static Date day;
    private final ArrayList<String> roomNames = new ArrayList<>();
    private final ArrayList<Integer> roomNumbers = new ArrayList<>();
    private final ArrayList<Integer> order = new ArrayList<>();
    private final static Font titles = new Font(Font.FontFamily.HELVETICA,25,Font.BOLD);
    private final static Font text = new Font(Font.FontFamily.HELVETICA,12,Font.NORMAL);
    private final static Color backColor = new Color(211,211,211);
    private static int titlePage =1;

    public pdfWriter(Connection con, Date day) {
        pdfWriter.con = con;
        pdfWriter.day = day;
    }
    public void run() {
        //pad first index out for title page
        roomNames.add("ignore");
        roomNumbers.add(-1);
        try {
            Document document = new Document();
            String FILE = "src/main/resources/report.pdf";
            //open a new document
            writer = PdfWriter.getInstance(document, new FileOutputStream(FILE));
            document.open();
            writer.setLinearPageMode();
            //add metadata
            addMetaData(document);
            //add the environment peaks of the current day
            addPeaks(document);
            //add all the environment and location data for each room
            addRooms(document);

            //add title page last, then add it to the start
            //required for adding hyperlinks
            addTitlePage(document);
            //get last page and reorder to put title first
            int total = writer.getPageNumber()-1;
            titlePage=total;
            order.add(0,total);
            for(int i=1;i<total;i++){
                order.add(i,i);
            }
            int[] arr = order.stream().mapToInt(Integer::intValue).toArray();
            //add title to front
            writer.reorderPages(arr);
            //close document and output
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    private static void addMetaData(Document document) {
        //add meta data to document
        document.addTitle("Daily report on: "+day);
        document.addSubject("Daily report");
        document.addKeywords("");
        document.addAuthor("");
        document.addCreator("");
    }
    private Rectangle addBack(){
        Rectangle background = new Rectangle(writer.getPageSize());
        background.setBackgroundColor(new BaseColor(backColor.getRGB()));
        return background;
    }
    private void addTitlePage(Document document) throws DocumentException {
        //main page to add content
        Paragraph main = new Paragraph();
        document.add(addBack());
        addEmptyLine(main, 1);
        //add domain
        Paragraph domain = new Paragraph(ServerApplication.getDomain()+" Report",new Font(titles.getFamily(),30,titles.getStyle()));
        domain.setAlignment(Element.ALIGN_CENTER);
        main.add(domain);
        //add title
        Paragraph title = new Paragraph("Click a Room to view it!",titles);
        title.setAlignment(Element.ALIGN_CENTER);
        main.add(title);
        addEmptyLine(main, 1);

        //create table for options
        PdfPTable options = new PdfPTable(1);
        options.setHorizontalAlignment(Element.ALIGN_CENTER);
        options.getDefaultCell().setVerticalAlignment(Element.ALIGN_CENTER);
        options.getDefaultCell().setHorizontalAlignment(Element.ALIGN_CENTER);
        //format table
        options.getDefaultCell().setBackgroundColor(BaseColor.LIGHT_GRAY);
        options.getDefaultCell().setFixedHeight(25);
        options.getDefaultCell().setBorderWidth(2);
        //setup peak hyperlink
        PdfAction page2 = PdfAction.gotoLocalPage(1,new PdfDestination(1),writer);
        Chunk peak = new Chunk("Peak over the last 24 hours",text);
        peak.setAction(page2);
        addEmptyLine(main,2);
        //wrap chunk in paragraph and add to table
        Paragraph center = new Paragraph();
        center.add(peak);
        center.setAlignment(Element.ALIGN_CENTER);
        options.addCell(center);

        //add all the hyperlinks
        addEmptyLine(main,4);
        main.add(options);
        addHyperLinks(options);
        addEmptyLine(main,4);
        //add info text
        Paragraph info = new Paragraph("Report generated for: "+ServerApplication.getDomain()+"\nDay generated for: "+
                day.toLocalDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) +"\nTime generated: "
                + LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) + " at "
                + LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")),text);
        info.setAlignment(Element.ALIGN_BOTTOM);
        info.setAlignment(Element.ALIGN_LEFT);
        main.add(info);
        document.add(main);

        //add title page
        document.newPage();
    }
    private void addRooms(Document document){
        try {
            //get all the rooms, but filter out the door sensors
            PreparedStatement selectStatement = con.prepareStatement(
                    "SELECT room_name FROM rooms WHERE room_name<>'gate1' AND room_name<>'gate2' "
            );
            ResultSet rs = selectStatement.executeQuery();
            while(rs.next()){
                //create a new page for each and store where they are located in arrays
                addRoomPage(document,rs.getString("room_name"));
                roomNames.add(rs.getString("room_name"));
                roomNumbers.add(writer.getCurrentPageNumber()-1);
            }
        }catch (Exception e){
            System.out.println("no rooms");
        }
    }
    private void addHyperLinks(PdfPTable table) {
        //loop through the amount of rooms
        for(int i =1;i< roomNumbers.size();i++){
            Paragraph main = new Paragraph();
            //add a hyperlink text to the corresponding page
            PdfAction page = PdfAction.gotoLocalPage(roomNumbers.get(i)-1,new PdfDestination(roomNumbers.get(i)-1),writer);
            Chunk chunk = new Chunk(roomNames.get(i),text);
            chunk.setAction(page);
            main.add(chunk);
            //add the text to the table
            table.addCell(main);
        }
    }
    private void home(){
        Paragraph main = new Paragraph();
        //add hyper link text
        PdfAction page = PdfAction.gotoLocalPage(writer.getPageNumber(),new PdfDestination(writer.getPageNumber()),writer);
        Chunk chunk = new Chunk("Back to top",new Font(Font.FontFamily.HELVETICA,15,Font.BOLD));
        chunk.setAction(page);
        main.add(chunk);
        //put it in table
        PdfPTable footerTbl = new PdfPTable(1);
        footerTbl.setTotalWidth(300);
        PdfPCell cell = new PdfPCell(main);

        cell.setBorder(0);
        //force add it to the bottom right of page
        footerTbl.addCell(cell);
        footerTbl.writeSelectedRows(0, -1, writer.getPageSize().getWidth()-100, 30,writer.getDirectContent());
    }
    private Image createGraph(String type,boolean peak,String roomName) {
        //creates bar and line graphs for environmental data
        JFreeChart chart = null;
        try {
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            TimePeriodValuesCollection xyDataset = new TimePeriodValuesCollection();
            TimePeriodValues xySeries = new TimePeriodValues(type);
            PreparedStatement selectStatement;

            if (peak) { //get the peak values for the type of graph wanted
                //default the barchart to 0 for each room
                selectStatement = con.prepareStatement(
                        "SELECT room_name FROM rooms WHERE room_name<>'gate1' AND room_name<>'gate2'"
                );
                ResultSet rs2 = selectStatement.executeQuery();
                while(rs2.next()){
                    dataset.addValue(0,rs2.getString("room_name"),rs2.getString("room_name"));
                }
                selectStatement = con.prepareStatement(
                        "SELECT ANY_VALUE(timestamp) as time,room_name,MAX(" + type + ") as value FROM roomEnvironment env " +
                                "JOIN rooms r ON env.room_id=r.room_id WHERE timestamp >= now() - INTERVAL 1 DAY GROUP BY room_name "
                );
            } else { //if not a peak graph - line graph
                selectStatement = con.prepareStatement(
                        "SELECT ANY_VALUE(timestamp) as time,room_name," + type + " as value FROM roomEnvironment env " +
                                "JOIN rooms r ON env.room_id=r.room_id WHERE r.room_name= \"" + roomName + "\""
                );
            }
            ResultSet rs = selectStatement.executeQuery();
            while (rs.next()) {
                //get all the values and format time
                int value = (int) rs.getDouble("value");
                Time t = rs.getTime("time");
                Date d = rs.getDate("time");

                String time = new SimpleDateFormat("HH:mm").format(t);
                String name = rs.getString("room_name") + "\n" + time;

                if(peak){
                    System.out.println(rs.getString("room_name"));
                    //update room with data if there is any
                    dataset.setValue(value, name, name);

                }else{
                    //if the day requested is the current day retrieved add the data
                    if(d.getTime()==day.getTime()){;
                        xySeries.add(new Second(t),value);
                    }
                }
            }
            //add series to dataset once all data is added
            if(!xySeries.isEmpty()){
                xyDataset.addSeries(xySeries);
            }
            //create chart and size title//
            if(peak) {
                switch (type) { //create peak graph depending on type requested
                    case "Temperature" ->
                            chart = ChartFactory.createStackedBarChart("Peak Temperature", "", "Temperature °C", dataset, PlotOrientation.VERTICAL, false, false, false);
                    case "Noise_level" ->
                            chart = ChartFactory.createStackedBarChart("Peak Noise Level", "", "Noise Level", dataset, PlotOrientation.VERTICAL, false, false, false);
                    case "Light_level" ->
                            chart = ChartFactory.createStackedBarChart("Peak Light level", "", "Light Level", dataset, PlotOrientation.VERTICAL, false, false, false);
                }
                assert chart != null;
                //if more than 4 datasets then change text to be vertical and size correctly
                if(dataset.getRowCount()>4){
                    chart.getCategoryPlot().getDomainAxis().setCategoryLabelPositions(CategoryLabelPositions.DOWN_90);
                    chart.getCategoryPlot().getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
                    chart.getCategoryPlot().getDomainAxis().setMaximumCategoryLabelLines(3);
                }else{//otherwise size correctly horizontal
                    chart.getCategoryPlot().getDomainAxis().setCategoryLabelPositions(CategoryLabelPositions.STANDARD);
                    chart.getCategoryPlot().getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 11));
                    chart.getCategoryPlot().getDomainAxis().setMaximumCategoryLabelLines(2);
                }
                //sets rooms with no data to be displayed correctly
                ((NumberAxis)chart.getCategoryPlot().getRangeAxis()).setAutoRangeIncludesZero(true);
                chart.getCategoryPlot().getRangeAxis().setFixedAutoRange(100);
                chart.getCategoryPlot().getRangeAxis().setLowerBound(0);
                //setup text inside of bar chart
                CategoryPlot plot = chart.getCategoryPlot();
                CategoryItemRenderer renderer = plot.getRenderer();
                CategoryItemLabelGenerator generator = new StandardCategoryItemLabelGenerator("{2}", NumberFormat.getInstance());
                //size and format correctly
                renderer.setDefaultItemLabelGenerator(generator);
                renderer.setDefaultItemLabelFont(new java.awt.Font(text.getFamilyname(), java.awt.Font.PLAIN, 12));
                renderer.setDefaultItemLabelsVisible(true);
                renderer.setDefaultPositiveItemLabelPosition(new ItemLabelPosition(ItemLabelAnchor.CENTER, TextAnchor.CENTER, TextAnchor.CENTER, 0.0));
            }else {
                chart = switch (type) {//create line graph depending on type requested
                    case "Temperature" ->
                            ChartFactory.createTimeSeriesChart("Temperature", "", "Temperature °C", xyDataset, false, false, false);
                    case "Noise_level" ->
                            ChartFactory.createTimeSeriesChart("Noise Level", "", "Noise Level", xyDataset, false, false, false);
                    case "Light_level" ->
                            ChartFactory.createTimeSeriesChart("Light level", "", "Light Level", xyDataset, false, false, false);
                    default -> null;
                };
                assert chart != null;
                ((NumberAxis)chart.getXYPlot().getRangeAxis()).setAutoRangeIncludesZero(true);
                XYLineAndShapeRenderer renderer = (XYLineAndShapeRenderer) chart.getXYPlot().getRenderer();
                //add dots at each data point
                renderer.setDefaultShape( new Ellipse2D.Double(-1d, -1d, 3d, 3d));
                renderer.setSeriesShape(0, new Ellipse2D.Double(-1d, -1d, 3d, 3d));
                renderer.setDefaultShapesVisible(true);
                chart.getXYPlot().getRenderer().setDefaultItemLabelFont(new java.awt.Font(text.getFamilyname(), java.awt.Font.PLAIN, 12));
            }
            //style charts
            chart.setBackgroundPaint(backColor);
            chart.getTitle().setHorizontalAlignment(HorizontalAlignment.CENTER);
            chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 15));
            //create image
            BufferedImage bufferedImage = chart.createBufferedImage(500,200);
            //return created image
            return Image.getInstance(writer,bufferedImage,1.0f);
        }catch (Exception e){e.printStackTrace();}
        return null;
    }
    private void addRoomPage(Document document,String room) throws DocumentException{
        Paragraph graphs = new Paragraph();
        document.add(addBack());
        //add room name title
        Paragraph title = new Paragraph(room,titles);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        addEmptyLine(graphs, 1);
        //add one of each graph
        graphs.add(createGraph("Temperature",false,room));
        graphs.add(createGraph("Noise_level",false,room));
        graphs.add(createGraph("Light_level",false,room));
        document.add(graphs);
        //new page
        document.newPage();
        //add location table
        document.add(addBack());
        document.add(createLocation(room));
        document.newPage();
    }
    private void addPeaks(Document document) throws DocumentException {
        Paragraph main = new Paragraph();
        document.add(addBack());
        //add title
        Paragraph title = new Paragraph("Peak Environmental data in the last 24hours",new Font(titles.getFamily(),22,titles.getStyle()));
        title.setAlignment(Element.ALIGN_CENTER);
        main.add(title);
        Paragraph disc = new Paragraph("(note: peak data will only show the last 24hours from current day)",new Font(text.getFamily(),text.getSize(),Font.ITALIC));
        disc.setAlignment(Element.ALIGN_CENTER);
        main.add(disc);
        addEmptyLine(main,1);
        //add one of each peak graph
        main.add(createGraph("Temperature",true,""));
        main.add(createGraph("Noise_level",true,""));
        main.add(createGraph("Light_level",true,""));
        document.add(main);
        document.newPage();
    }

    private static Paragraph createLocation(String roomName){
        Paragraph main = new Paragraph();

        //add a title
        Paragraph title = new Paragraph("Location History",titles);
        title.setAlignment(Element.ALIGN_CENTER);
        main.add(title);
        //create a table
        addEmptyLine(main,1);
        PdfPTable table = new PdfPTable(2);
        //add headings
        PdfPCell username = new PdfPCell(new Phrase("Username",text));
        username.setHorizontalAlignment(Element.ALIGN_CENTER);
        username.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(username);

        PdfPCell time = new PdfPCell(new Phrase("Entry Time",text));
        time.setHorizontalAlignment(Element.ALIGN_CENTER);
        time.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(time);

        table.setHeaderRows(1);

        PreparedStatement selectStatement;
        ResultSet rs;
        try{
        selectStatement = con.prepareStatement(
                //get all location data from db
                "SELECT u.username, r.room_name, ro.entry_timestamp " +
                        "FROM users u "+
                        "JOIN roomoccupants ro ON u.user_id = ro.user_id " +
                        "JOIN rooms r ON ro.room_id = r.room_id "+
                        "WHERE r.room_name = \"" +roomName+"\""
        );
        rs = selectStatement.executeQuery();
            String prevName="";
            if(rs.next()){
                //style each cell
                table.getDefaultCell().setBorderWidth(2);
                while(rs.next()) {
                    String name = rs.getString("username");
                    Timestamp t = rs.getTimestamp("entry_timestamp");
                    Date d = rs.getDate("entry_timestamp");
                    if(d.getTime()!=day.getTime()){
                        table.addCell("");
                        table.addCell("");
                        continue;
                    }
                    if(name.equals(prevName)){ //if the same name but new timestamp
                        table.addCell("");
                        table.addCell(t.toString()); //add timestamp, blank name
                    }else{
                        table.addCell(name);  //otherwise add both
                        table.addCell(t.toString());
                    }
                    prevName=name;
                }
                table.getDefaultCell().setBorderWidth(0); //reset cells
            }else{ //if no db data, add blank cells (preserves headings)
                table.addCell("");
                table.addCell("");
            }
        }catch (Exception e){e.printStackTrace();}
        //return table
       main.add(table);
      return main;
    }
    private static void addEmptyLine(Paragraph paragraph, int number) {
        //return a blank line
        for (int i = 0; i < number; i++) {
            paragraph.add(new Paragraph(" "));
        }
    }
}